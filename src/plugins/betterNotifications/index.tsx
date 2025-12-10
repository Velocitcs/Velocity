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

import "./styles.css";

import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import { Guild, Message } from "@velocity-types";

import { buildSoundMap, getSoundEntries, settings } from "./settings";

function getCustomSoundUrl(message: Message, guild: Guild) {
    if (!message.author) return null;

    const soundEntries = getSoundEntries();
    const { userSounds, guildSounds } = buildSoundMap(soundEntries);

    const guildId = guild?.id;

    if (guildId && guildSounds[guildId]) {
        const sound = guildSounds[guildId];
        return { url: sound.soundUrl, volume: sound.volume };
    }

    if (guildSounds["*"]) {
        const sound = guildSounds["*"];
        return { url: sound.soundUrl, volume: sound.volume };
    }

    if (userSounds[message.author.id]) {
        const sound = userSounds[message.author.id];
        return { url: sound.soundUrl, volume: sound.volume };
    }

    return null;
}

export default definePlugin({
    name: "BetterNotifications",
    description: "Customize notification sounds by user or server",
    authors: [Devs.Velocity],
    settings,

    patches: [
        {
            find: ".getDesktopType()===",
            replacement: {
                match: /sound:(\i)\?(\i):void 0,volume:([^,]+),onClick/,
                replace: "sound:($self.handleSoundLogic(arguments[0]?.message, { id: arguments[0]?.guildId }))?undefined:($1?$2:void 0),volume:$3,onClick"
            }
        }
    ],

    handleSoundLogic(message: Message, guild: Guild) {
        const customSound = getCustomSoundUrl(message, guild);
        if (customSound) {
            if (settings.store.preventOverlap && this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio = null;
            }

            const audio = new Audio(customSound.url);
            audio.volume = customSound.volume;

            if (settings.store.preventOverlap) {
                this.currentAudio = audio;
                audio.onended = () => {
                    this.currentAudio = null;
                };
            }

            audio.play().catch(err => {
                new Logger("BetterNotifications").error("Playback failed:", err);
            });

            return true;
        }
        return false;
    }
});
