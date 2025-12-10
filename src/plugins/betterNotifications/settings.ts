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

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { SoundSettings } from "./components/SoundSettings";

export interface SoundEntry {
    id: string;
    type: "user" | "guild";
    userId: string;
    displayName?: string;
    userLabel?: string;
    guildId: string;
    guildName?: string;
    soundUrl: string;
    filename?: string;
    volume: number;
}

export interface SoundData {
    soundUrl: string;
    volume: number;
}

export const settings = definePluginSettings({
    soundSettings: {
        type: OptionType.COMPONENT,
        component: SoundSettings
    },
    preventOverlap: {
        type: OptionType.BOOLEAN,
        description: "Prevents the notifcations from overlapping",
        default: false
    },
    soundEntries: {
        type: OptionType.STRING,
        description: "Sound entries configuration (JSON format)",
        default: "[]",
        hidden: true
    }
});

export function getSoundEntries(): SoundEntry[] {
    try {
        const value = settings.store.soundEntries;
        if (typeof value === "string") {
            return JSON.parse(value);
        }
        return [];
    } catch {
        return [];
    }
}

export function saveSoundEntries(entries: SoundEntry[]): void {
    settings.store.soundEntries = JSON.stringify(entries);
}

export function buildSoundMap(entries: SoundEntry[]): {
    userSounds: Record<string, SoundData>;
    displayNameSounds: Record<string, SoundData>;
    guildSounds: Record<string, SoundData>;
} {
    const userSounds: Record<string, SoundData> = {};
    const displayNameSounds: Record<string, SoundData> = {};
    const guildSounds: Record<string, SoundData> = {};

    entries.forEach(entry => {
        if (entry.type === "user") {
            if (entry.userId) {
                userSounds[entry.userId] = { soundUrl: entry.soundUrl, volume: entry.volume };
            }
            if (entry.displayName) {
                displayNameSounds[entry.displayName] = { soundUrl: entry.soundUrl, volume: entry.volume };
            }
        } else if (entry.type === "guild" && entry.guildId) {
            guildSounds[entry.guildId] = { soundUrl: entry.soundUrl, volume: entry.volume };
        }
    });
    return { userSounds, displayNameSounds, guildSounds };
}
