/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Devs } from "@utils/constants";
import { sleep } from "@utils/misc";
import definePlugin from "@utils/types";
import { findByCodeLazy, findStoreLazy } from "@webpack";

import type { Quest, TaskType } from "./types";
import { cleanup, isValidQuest, state, TASK_HANDLERS } from "./utils";

const QuestsStore = findStoreLazy("QuestsStore");
const enrollQuest = findByCodeLazy("QUESTS_ENROLL_BEGIN");
const claimReward = findByCodeLazy("QUESTS_CLAIM_REWARD_BEGIN");

const failedQuests = new Set<string>();

async function tryAcceptAndRun() {

    const { quests } = QuestsStore;
    if (!quests?.size) return;

    const unenrolledQuests = [...quests.values()].filter(q =>
        !q.userStatus?.enrolledAt &&
        !q.userStatus?.completedAt &&
        !q.userStatus?.claimedAt &&
        !QuestsStore.isQuestExpired(q.id) &&
        !failedQuests.has(q.id)
    );

    if (unenrolledQuests.length === 0) {
        tryRun();
        return;
    }


    for (const quest of unenrolledQuests) {
        const result = await enrollQuest(quest.id, { questContent: "QUESTS_BAR" });
        if (result.type !== "success") failedQuests.add(quest.id);
        await sleep(2000);
    }

    await sleep(1000);
    tryRun();
}

function tryRun() {
    const { quests } = QuestsStore;
    if (!quests?.size) return;

    const quest = [...quests.values()].find(isValidQuest);
    if (!quest || quest.id === state.currentQuestId) return;

    state.currentQuestId = quest.id;
    const cfg = quest.config.taskConfig ?? quest.config.taskConfigV2;
    const task = Object.keys(cfg.tasks).find(t => cfg.tasks[t]) as TaskType;
    if (!task || !TASK_HANDLERS[task]) return;

    const { target } = cfg.tasks[task];
    const progress = quest.userStatus?.progress?.[task]?.value ?? 0;

    TASK_HANDLERS[task](quest, target, progress);
}

async function checkAndContinue() {
    cleanup();
    await sleep(2000);

    const { quests } = QuestsStore;
    for (const quest of quests.values()) {
        if (quest.userStatus?.completedAt && !quest.userStatus?.claimedAt) {
            const platform = quest.config.rewardsConfig.platforms[0];
            if (platform) {
                await claimReward(quest.id, platform, "QUESTS_BAR");
                await sleep(500);
            }
        }
    }

    tryAcceptAndRun();
}

export default definePlugin({
    name: "SpoofQuest",
    description: "Spoof quest progress",
    authors: [Devs.Velocity],
    patches: [
        {
            find: "e5.current=e",
            lazy: true,
            replacement: {
                match: /(e5\.current=e[^}]*)(})/,
                replace: "$1;if(e)e.playbackRate=16$2"
            }
        },
        {
            find: "seekForwardEnabled:nc",
            lazy: true,
            replacement: {
                match: /seekForwardEnabled:(\i\i)/,
                replace: "seekForwardEnabled:true"
            }
        }
    ],

    start() {
        failedQuests.clear();
        tryAcceptAndRun();
    },

    stop() {
        cleanup();
        failedQuests.clear();
    },

    flux: {
        QUESTS_SEND_HEARTBEAT_SUCCESS(e: any) {
            state.onBeat?.(e);
            const quest = [...QuestsStore.quests.values()].find((q: Quest) => q.id === state.currentQuestId);
            if (quest?.userStatus?.completedAt) checkAndContinue();
        },
        async QUESTS_ENROLL_SUCCESS() {
            cleanup();
            await sleep(100);
            tryRun();
        },
        QUESTS_FETCH_CURRENT_QUESTS_SUCCESS() {
            tryAcceptAndRun();
        }
    }
});
