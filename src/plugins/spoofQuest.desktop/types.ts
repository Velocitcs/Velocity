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

export interface QuestProgress {
    [task: string]: number;
}

export interface QuestUserStatus {
    enrolledAt?: Date | null;
    completedAt?: Date | null;
    claimedAt?: Date | null;
    progress?: QuestProgress;
    streamProgressSeconds?: number;
}

export interface Quest {
    id: string;
    userStatus?: {
        enrolledAt?: string | Date | null;
        completedAt?: string | Date | null;
        claimedAt?: string | Date | null;
        progress?: Record<string, { value: number; }>;
        streamProgressSeconds?: number;
    };
    config: {
        expiresAt?: string | Date | null;
        application: { id: string; name: string; };
        taskConfig?: any;
        taskConfigV2?: any;
        configVersion?: number;
        messages?: { questName?: string; };
        rewardsConfig?: { platforms?: string[]; };
    };
}

export type TaskType = | "WATCH_VIDEO" | "WATCH_VIDEO_ON_MOBILE" | "PLAY_ON_DESKTOP" | "STREAM_ON_DESKTOP" | "PLAY_ACTIVITY" | "PLAY_ON_XBOX" | "PLAY_ON_PLAYSTATION" | "ACHIEVEMENT_IN_GAME" | "ACHIEVEMENT_IN_ACTIVITY";

export interface HeartbeatData {
    questId: string;
    streamKey?: string;
    userStatus: {
        streamProgressSeconds?: number;
        progress: QuestProgress;
    };
}
