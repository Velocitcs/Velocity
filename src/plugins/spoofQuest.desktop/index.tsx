/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2025 Velocitcs and contributors
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
import { findByCodeLazy } from "@webpack";
import { QuestStore } from "@webpack/common";

import type { Quest, TaskType } from "./types";
import { cleanup, isValidQuest, state, TASK_HANDLERS } from "./utils";

const enrollQuest = findByCodeLazy("QUESTS_ENROLL_BEGIN");
const claimReward = findByCodeLazy("QUESTS_CLAIM_REWARD_BEGIN");

const failedQuests = new Set<string>();

async function tryAcceptAndRun() {
    const { quests } = QuestStore;
    if (!quests?.size) return;

    const unenrolledQuests = [...quests.values()].filter(q =>
        !q.userStatus?.enrolledAt &&
        !q.userStatus?.completedAt &&
        !q.userStatus?.claimedAt &&
        !QuestStore.isQuestExpired(q.id) &&
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
    const { quests } = QuestStore;
    if (!quests?.size) return;

    const quest = [...quests.values()].find(isValidQuest);
    if (!quest || quest.id === state.currentQuestId) return;

    state.currentQuestId = quest.id;
    const cfg = quest.config.taskConfig ?? quest.config.taskConfigV2;
    const task = Object.keys(cfg.tasks).find(t => cfg.tasks[t]) as TaskType;
    if (!task || !TASK_HANDLERS[task]) return;

    const { target } = cfg.tasks[task];
    const raw = quest.userStatus?.progress?.[task];
    const progress = typeof raw === "number" ? raw : raw?.value ?? 0;

    TASK_HANDLERS[task](quest, target, progress);

}

async function checkAndContinue() {
    cleanup();
    await sleep(2000);

    const { quests } = QuestStore;
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
            find: "VIDEO_HLS&&tU(ti)",
            lazy: true,
            replacement: {
                match: /(onLoadedMetadata:\i=>\{null!=)(\i)(\.current&&\(.*?VIDEO_HLS&&\i\(\i\),)(\i)\?(\i)\.current\.volume=0:(\i)\.current\.volume=(\i)\)/,
                replace: "$1$2$3$2.current.playbackRate=14,$4?$5.current.volume=0:$6.current.volume=$7)"
            }
        },
        {
            find: "handleLoadedMetadata | videoAssetId:",
            lazy: true,
            replacement: {
                match: /seekForwardEnabled:(\i\d)/,
                replace: "seekForwardEnabled:true"
            }
        },
        {
            find: "videoInner,{[_.focused]:a}",
            replacement: {
                match: /\[_\.focused\]:(\i)/,
                replace: "[_.focused]:true"
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
            const quest = [...QuestStore.quests.values()].find((q: Quest) => q.id === state.currentQuestId);
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
