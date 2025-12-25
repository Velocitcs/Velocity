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

import { ApplicationStreamingStore, ChannelStore, FluxDispatcher, GuildChannelStore, RestAPI, RunningGameStore } from "@webpack/common";

import type { HeartbeatData, Quest, TaskType } from "./types";

export const state = {
    currentQuestId: null as string | null,
    activeQuestIntervals: new Map<string, {
        type: string;
        progressTimeout: any;
        rerenderTimeout: any;
        progress: number;
        enabled: boolean;
    }>(),
    autoCompleteEnabled: new Set<string>(),
    shouldStop: false,
    stopCurrentQuest: false,

    onBeat: null as ((data: HeartbeatData, questId: string) => void) | null,
    interval: null as any,
    unsubscribe: null as (() => void) | null,

    fakeGame: null as any,
    origGetRunningGames: null as any,
    origGetGameForPID: null as any,
};

export const getProgress = (x: any) => typeof x === "number" ? x : x?.value ?? 0;

export const cleanup = () => {
    state.onBeat = null;
    state.currentQuestId = null;
    state.shouldStop = false;

    if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
    }

    if (state.unsubscribe) {
        state.unsubscribe();
        state.unsubscribe = null;
    }

    state.activeQuestIntervals.forEach(({ progressTimeout, rerenderTimeout }) => {
        if (progressTimeout) clearInterval(progressTimeout);
        if (rerenderTimeout) clearTimeout(rerenderTimeout);
    });
    state.activeQuestIntervals.clear();

    if (state.fakeGame && state.origGetRunningGames) {
        RunningGameStore.getRunningGames = state.origGetRunningGames;
        RunningGameStore.getGameForPID = state.origGetGameForPID;
        FluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: [state.fakeGame],
            added: [],
            games: []
        });
        state.fakeGame = null;
        state.origGetRunningGames = null;
        state.origGetGameForPID = null;
    }
};

export const isValidQuest = (q: Quest) =>
    !!q.userStatus?.enrolledAt &&
    !q.userStatus.completedAt &&
    !!q.config.expiresAt &&
    new Date(q.config.expiresAt).getTime() > Date.now();

const sendBeat = async (quest: Quest, streamKey: string, applicationId: string, terminal: boolean = false): Promise<number> => {
    if (state.shouldStop) return 0;

    try {
        const res = await RestAPI.post({
            url: `/quests/${quest.id}/heartbeat`,
            body: {
                stream_key: streamKey,
                application_id: applicationId,
                terminal
            }
        });

        const progress = res.body?.progress;
        return getProgress(
            progress?.PLAY_ACTIVITY ||
            progress?.PLAY_ON_DESKTOP ||
            progress?.PLAY_ON_XBOX ||
            progress?.PLAY_ON_PLAYSTATION ||
            progress?.STREAM_ON_DESKTOP ||
            progress?.ACHIEVEMENT_IN_GAME ||
            progress?.ACHIEVEMENT_IN_ACTIVITY
        );
    } catch (e) {
        return 0;
    }
};

export const handleVideo = async (quest: Quest, target: number, progress: number, activeQuestIntervals: Map<string, any>) => {
    if (state.shouldStop || !activeQuestIntervals.has(quest.id)) return;

    const interval = activeQuestIntervals.get(quest.id);
    if (!interval) return;

    const enrolled = new Date(quest.userStatus!.enrolledAt as any).getTime();
    let current = progress;
    let done = false;

    const tick = async () => {
        if (done || state.shouldStop || !activeQuestIntervals.has(quest.id)) return;
        if (!interval.enabled) return;

        const allowed = Math.floor((Date.now() - enrolled) / 1000) + 10;
        const diff = allowed - current;
        const timestamp = current + 7;

        if (diff >= 7) {
            try {
                const res = await RestAPI.post({
                    url: `/quests/${quest.id}/video-progress`,
                    body: { timestamp: Math.min(target, timestamp + Math.random()) }
                });

                done = res.body?.completed_at != null;
                current = Math.min(target, timestamp);
                interval.progress = current;
            } catch (e) { }
        }

        if (timestamp >= target && !done) {
            try {
                await RestAPI.post({
                    url: `/quests/${quest.id}/video-progress`,
                    body: { timestamp: target }
                });
                done = true;
            } catch (e) { }
        }
    };

    state.interval = setInterval(async () => {
        if (done || state.shouldStop || !activeQuestIntervals.has(quest.id)) {
            if (state.interval) clearInterval(state.interval);
            state.interval = null;
            activeQuestIntervals.delete(quest.id);
            return;
        }
        await tick();
    }, 1000);
};

export const handleDesktopTask = (quest: Quest, target: number, _progress: number, isStream: boolean, activeQuestIntervals: Map<string, any>) => {
    if (state.shouldStop || !activeQuestIntervals.has(quest.id)) return;

    const interval = activeQuestIntervals.get(quest.id);
    if (!interval) return;

    const { id: appId, name: appName } = quest.config.application;
    const pid = Math.floor(Math.random() * 30000) + 1000;
    let shouldRun = true;

    if (isStream) {
        const orig = ApplicationStreamingStore.getStreamerActiveStreamMetadata;

        ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => {
            if (!shouldRun || !interval.enabled) {
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = orig;
                return null;
            }
            return { id: appId, pid, sourceName: null };
        };

        state.onBeat = (data: HeartbeatData) => {
            if (!shouldRun || !interval.enabled || state.shouldStop || !activeQuestIntervals.has(quest.id)) {
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = orig;
                state.onBeat = null;
                return;
            }

            const raw = data.userStatus.progress.STREAM_ON_DESKTOP;
            const val = Math.floor(
                quest.config.configVersion === 1
                    ? data.userStatus.streamProgressSeconds ?? 0
                    : getProgress(raw)
            );

            interval.progress = val;

            if (val >= target) {
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = orig;
                shouldRun = false;
                activeQuestIntervals.delete(quest.id);
            }
        };
    } else {
        const fake = {
            cmdLine: `C:\\Program Files\\${appName}\\${appName}.exe`,
            exeName: `${appName}.exe`,
            exePath: `c:/program files/${appName.toLowerCase()}/${appName}.exe`,
            hidden: false,
            isLauncher: false,
            id: appId,
            name: appName,
            pid,
            pidPath: [pid],
            processName: appName,
            start: Date.now(),
            lastFocused: Math.floor(Date.now() / 1000)
        };

        state.origGetRunningGames = RunningGameStore.getRunningGames;
        state.origGetGameForPID = RunningGameStore.getGameForPID;
        state.fakeGame = fake;

        RunningGameStore.getRunningGames = () => {
            return (shouldRun && interval.enabled) ? [fake] : [];
        };

        RunningGameStore.getGameForPID = (p: number) => {
            return (shouldRun && interval.enabled && p === pid) ? fake : null;
        };

        FluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: state.origGetRunningGames(),
            added: [fake],
            games: [fake]
        });

        state.onBeat = (data: HeartbeatData) => {
            if (!shouldRun || !interval.enabled || state.shouldStop || !activeQuestIntervals.has(quest.id)) {
                RunningGameStore.getRunningGames = state.origGetRunningGames;
                RunningGameStore.getGameForPID = state.origGetGameForPID;

                FluxDispatcher.dispatch({
                    type: "RUNNING_GAMES_CHANGE",
                    removed: [fake],
                    added: [],
                    games: []
                });

                state.onBeat = null;
                return;
            }

            const raw = data.userStatus.progress.PLAY_ON_DESKTOP;
            const val = Math.floor(
                quest.config.configVersion === 1
                    ? data.userStatus.streamProgressSeconds ?? 0
                    : getProgress(raw)
            );

            interval.progress = val;

            if (val >= target) {
                RunningGameStore.getRunningGames = state.origGetRunningGames;
                RunningGameStore.getGameForPID = state.origGetGameForPID;

                FluxDispatcher.dispatch({
                    type: "RUNNING_GAMES_CHANGE",
                    removed: [fake],
                    added: [],
                    games: []
                });

                shouldRun = false;
                activeQuestIntervals.delete(quest.id);
            }
        };
    }

    state.unsubscribe = () => {
        shouldRun = false;
        state.onBeat = null;
    };
};

export const handleActivityTask = (quest: Quest, target: number, activeQuestIntervals: Map<string, any>) => {
    if (state.shouldStop || !activeQuestIntervals.has(quest.id)) return;

    let channelId = ChannelStore.getSortedPrivateChannels()?.[0]?.id;

    if (!channelId) {
        const guildWithVoice = Object.values(GuildChannelStore.getAllGuilds())
            .find((x: any) => x?.VOCAL?.length > 0);

        if (guildWithVoice)
            channelId = (guildWithVoice as any).VOCAL[0].channel.id;
    }

    if (!channelId) return;

    const interval = activeQuestIntervals.get(quest.id);
    if (!interval) return;

    let running = true;

    (async () => {
        while (!state.shouldStop && activeQuestIntervals.has(quest.id) && running) {
            while (!interval.enabled && running && activeQuestIntervals.has(quest.id)) {
                await new Promise(r => setTimeout(r, 100));
            }

            if (!running || state.shouldStop || !activeQuestIntervals.has(quest.id)) break;

            const prog = await sendBeat(quest, `call:${channelId}:1`, quest.config.application.id, false);
            interval.progress = prog;

            if (prog >= target) {
                await sendBeat(quest, `call:${channelId}:1`, quest.config.application.id, true);
                activeQuestIntervals.delete(quest.id);
                return;
            }

            await new Promise(r => setTimeout(r, 20000));
        }
        activeQuestIntervals.delete(quest.id);
    })();

    state.unsubscribe = () => { running = false; };
};

export const handleAchievementTask = (quest: Quest, target: number, activeQuestIntervals: Map<string, any>) => {
    if (state.shouldStop || !activeQuestIntervals.has(quest.id)) return;

    const interval = activeQuestIntervals.get(quest.id);
    if (!interval) return;

    let running = true;

    (async () => {
        while (!state.shouldStop && activeQuestIntervals.has(quest.id) && running) {
            while (!interval.enabled && running && activeQuestIntervals.has(quest.id)) {
                await new Promise(r => setTimeout(r, 100));
            }

            if (!running || state.shouldStop || !activeQuestIntervals.has(quest.id)) break;

            const prog = await sendBeat(quest, `achievement:${quest.id}:1`, quest.config.application.id, false);
            interval.progress = prog;

            if (prog >= target) {
                activeQuestIntervals.delete(quest.id);
                return;
            }

            await new Promise(r => setTimeout(r, 20000));
        }
        activeQuestIntervals.delete(quest.id);
    })();

    state.unsubscribe = () => { running = false; };
};

export const TASK_HANDLERS: Record<TaskType, (quest: Quest, target: number, progress: number, activeQuestIntervals?: Map<string, any>) => void> = {
    WATCH_VIDEO: (q, t, p, a) => handleVideo(q, t, p, a!),
    WATCH_VIDEO_ON_MOBILE: (q, t, p, a) => handleVideo(q, t, p, a!),
    PLAY_ON_DESKTOP: (q, t, p, a) => handleDesktopTask(q, t, p, false, a!),
    STREAM_ON_DESKTOP: (q, t, p, a) => handleDesktopTask(q, t, p, true, a!),
    PLAY_ACTIVITY: (q, t, p, a) => handleActivityTask(q, t, a!),
    PLAY_ON_XBOX: (q, t, p, a) => handleDesktopTask(q, t, p, false, a!),
    PLAY_ON_PLAYSTATION: (q, t, p, a) => handleDesktopTask(q, t, p, false, a!),
    ACHIEVEMENT_IN_GAME: (q, t, p, a) => handleAchievementTask(q, t, a!),
    ACHIEVEMENT_IN_ACTIVITY: (q, t, p, a) => handleAchievementTask(q, t, a!)
};
