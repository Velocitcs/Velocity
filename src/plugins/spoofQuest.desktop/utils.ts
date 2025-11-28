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
    onBeat: null as ((data: HeartbeatData) => void) | null,
    interval: null as any,
    unsubscribe: null as (() => void) | null,
    fakeGame: null as any,
    origGetRunningGames: null as any,
    origGetGameForPID: null as any,
    currentQuestId: null as string | null
};

// support number or { value }
const getProgress = (x: any) => typeof x === "number" ? x : x?.value ?? 0;

export const cleanup = () => {
    state.onBeat = null;
    state.currentQuestId = null;

    if (state.interval) clearInterval(state.interval), state.interval = null;
    if (state.unsubscribe) state.unsubscribe(), state.unsubscribe = null;

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

export const handleVideo = async (quest: Quest, target: number, progress: number) => {
    const enrolled = new Date(quest.userStatus!.enrolledAt as any).getTime();
    let current = progress;
    let done = false;

    const tick = async () => {
        if (done) return;

        const allowed = Math.floor((Date.now() - enrolled) / 1000) + 10;
        const diff = allowed - current;
        const timestamp = current + 7;

        if (diff >= 7) {
            const res = await RestAPI.post({
                url: `/quests/${quest.id}/video-progress`,
                body: { timestamp: Math.min(target, timestamp + Math.random()) }
            });

            done = res.body?.completed_at != null;
            current = Math.min(target, timestamp);
        }

        if (timestamp >= target && !done) {
            await RestAPI.post({
                url: `/quests/${quest.id}/video-progress`,
                body: { timestamp: target }
            });
            done = true;
        }
    };

    state.interval = setInterval(async () => {
        if (done) {
            if (state.interval) clearInterval(state.interval);
            state.interval = null;
            return;
        }
        await tick();
    }, 1000);
};

export const handleDesktopTask = (quest: Quest, target: number, _progress: number, isStream: boolean) => {
    const { id: appId, name: appName } = quest.config.application;
    const pid = Math.floor(Math.random() * 30000) + 1000;

    if (isStream) {
        const orig = ApplicationStreamingStore.getStreamerActiveStreamMetadata;

        ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
            id: appId,
            pid,
            sourceName: null
        });

        state.onBeat = (data: HeartbeatData) => {
            const raw = data.userStatus.progress.STREAM_ON_DESKTOP;
            const val = Math.floor(
                quest.config.configVersion === 1
                    ? data.userStatus.streamProgressSeconds ?? 0
                    : getProgress(raw)
            );

            if (val >= target) {
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = orig;
                state.onBeat = null;
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

        RunningGameStore.getRunningGames = () => [fake];
        RunningGameStore.getGameForPID = (p: number) => (p === pid ? fake : null);

        FluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: state.origGetRunningGames(),
            added: [fake],
            games: [fake]
        });

        state.onBeat = (data: HeartbeatData) => {
            const raw = data.userStatus.progress.PLAY_ON_DESKTOP;
            const val = Math.floor(
                quest.config.configVersion === 1
                    ? data.userStatus.streamProgressSeconds ?? 0
                    : getProgress(raw)
            );

            if (val >= target) {
                RunningGameStore.getRunningGames = state.origGetRunningGames;
                RunningGameStore.getGameForPID = state.origGetGameForPID;

                FluxDispatcher.dispatch({
                    type: "RUNNING_GAMES_CHANGE",
                    removed: [fake],
                    added: [],
                    games: []
                });

                state.onBeat = null;
            }
        };
    }
};

export const handleActivityTask = (quest: Quest, target: number) => {
    let channelId = ChannelStore.getSortedPrivateChannels()?.[0]?.id;

    if (!channelId) {
        const guildWithVoice = Object.values(GuildChannelStore.getAllGuilds())
            .find((x: any) => x?.VOCAL?.length > 0);

        if (guildWithVoice)
            channelId = (guildWithVoice as any).VOCAL[0].channel.id;
    }

    if (!channelId) return;

    let running = true;

    const sendBeat = async (terminal = false) => {
        if (!running) return 0;

        const res = await RestAPI.post({
            url: `/quests/${quest.id}/heartbeat`,
            body: { stream_key: `call:${channelId}:1`, terminal }
        });

        return getProgress(res.body?.progress?.PLAY_ACTIVITY);
    };

    (async () => {
        while (running) {
            const prog = await sendBeat();
            if (prog >= target) {
                await sendBeat(true);
                return;
            }

            await new Promise(r => setTimeout(r, 20000));
        }
    })();

    state.unsubscribe = () => (running = false);
};

export const TASK_HANDLERS: Record<TaskType, (quest: Quest, target: number, progress: number) => void> = {
    WATCH_VIDEO: handleVideo,
    WATCH_VIDEO_ON_MOBILE: handleVideo,
    PLAY_ON_DESKTOP: (q, t, p) => handleDesktopTask(q, t, p, false),
    STREAM_ON_DESKTOP: (q, t, p) => handleDesktopTask(q, t, p, true),
    PLAY_ACTIVITY: handleActivityTask
};
