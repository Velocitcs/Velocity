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
import { cleanup, getProgress, isValidQuest, state, TASK_HANDLERS } from "./utils";

const enrollQuest = findByCodeLazy("QUESTS_ENROLL_BEGIN");
const claimReward = findByCodeLazy("QUESTS_CLAIM_REWARD_BEGIN");

const failedQuests = new Set<string>();

async function enrollUnenrolledQuests() {
    const { quests } = QuestStore;
    if (!quests?.size) return;

    const expiredMap = QuestStore.getExpiredQuestsMap();
    const unenrolledQuests = [...quests.values()].filter(q =>
        !q.userStatus?.enrolledAt &&
        !q.userStatus?.completedAt &&
        !q.userStatus?.claimedAt &&
        !expiredMap.get(q.id) &&
        !failedQuests.has(q.id)
    );

    if (unenrolledQuests.length === 0) {
        runNextQuest();
        return;
    }

    for (const quest of unenrolledQuests) {
        const result = await enrollQuest(quest.id, { questContent: "QUESTS_BAR" });
        if (result.type !== "success") failedQuests.add(quest.id);
        await sleep(2000);
    }

    await sleep(1000);
    runNextQuest();
}

function runNextQuest() {
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
    const progress = getProgress(raw);

    state.activeQuestIntervals.set(quest.id, {
        progressTimeout: null as any,
        rerenderTimeout: null as any,
        progress,
        type: task,
        enabled: true
    });
    TASK_HANDLERS[task](quest, target, progress, state.activeQuestIntervals);
}

async function claimCompletedQuests() {
    cleanup();
    await sleep(2000);

    const { quests } = QuestStore;
    for (const quest of quests.values()) {
        if (quest.userStatus?.completedAt && !quest.userStatus?.claimedAt) {
            const platform = quest.config.rewardsConfig?.platforms?.[0];
            if (platform) {
                await claimReward(quest.id, platform, "QUESTS_BAR");
                await sleep(500);
            }
        }
    }

    enrollUnenrolledQuests();
}

export default definePlugin({
    name: "SpoofQuest",
    description: "Spoof quest progress",
    authors: [Devs.Velocity],
    patches: [
        {
            find: "onLoadedMetadata:e=>{null!=e2.current&&(tl.info",
            lazy: true,
            replacement: {
                match: /onLoadedMetadata:e=>\{null!=e2\.current&&\(tl\.info/,
                replace: "onLoadedMetadata:e=>{null!=e2.current&&(e2.current.playbackRate=7,tl.info"
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
            find: "onLoadedMetadata:e=>{null!=e2.current&&(tl.info(\"[QV]",
            replacement: {
                match: /onLoadedMetadata:e=>\{null!=e2\.current&&\(tl\.info\("\[QV\] \| handleLoadedMetadata/,
                replace: "onLoadedMetadata:e=>{null!=e2.current&&(e2.current.focused=true,tl.info(\"[QV]"
            }
        },
        {
            find: "handleCanPlay: did NOT early return",
            replacement: {
                match: /\$!==d\.Dvm\.HIDDEN&&\$!==d\.Dvm\.EXITING&&\$!==d\.Dvm\.EXITED&&\(null==\$\|\|!eE\||ev\|e7\)&&\(!ep\|ef\|e7\)\|\|null==e2\.current\|eO!==w\.rq\.PLAYING\|\(tl\.info/,
                replace: "true||(tl.info"
            }
        }
    ],

    start() {
        failedQuests.clear();
        state.shouldStop = false;
        enrollUnenrolledQuests();
    },

    stop() {
        cleanup();
        failedQuests.clear();
        state.activeQuestIntervals.forEach(interval => {
            if (interval.progressTimeout) clearInterval(interval.progressTimeout);
            if (interval.rerenderTimeout) clearTimeout(interval.rerenderTimeout);
        });
        state.activeQuestIntervals.clear();
    },

    flux: {
        QUESTS_SEND_HEARTBEAT_SUCCESS(e: any) {
            const questId = e.userStatus?.questId;
            if (!questId || !state.activeQuestIntervals.has(questId)) return;

            const interval = state.activeQuestIntervals.get(questId);
            if (!interval?.enabled) return;

            state.onBeat?.(e, questId);
            const quest = [...QuestStore.quests.values()].find((q: Quest) => q.id === questId);
            if (quest?.userStatus?.completedAt) claimCompletedQuests();
        },
        async QUESTS_ENROLL_SUCCESS() {
            cleanup();
            await sleep(100);
            runNextQuest();
        },
        QUESTS_FETCH_CURRENT_QUESTS_SUCCESS() {
            enrollUnenrolledQuests();
        }
    }
});
