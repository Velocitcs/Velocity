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
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    contractions: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "auto-correct contractions. dont = don't. its = it's.. etc "
    },
    capitalization: {
        type: OptionType.BOOLEAN,
        default: false,
        description: "capitalize first letter"
    }
});

const corrections: Record<string, string> = {
    arent: "aren't",
    cant: "can't",
    couldnt: "couldn't",
    aint: "ain't",
    didnt: "didn't",
    doesnt: "doesn't",
    dont: "don't",
    hadnt: "hadn't",
    hasnt: "hasn't",
    havent: "haven't",
    hes: "he's",
    id_: "I'd",
    im: "I'm",
    ive: "I've",
    isnt: "isn't",
    lets: "let's",
    shes: "she's",
    shouldnt: "shouldn't",
    thats: "that's",
    theres: "there's",
    theyre: "they're",
    wasnt: "wasn't",
    werent: "weren't",
    whats: "what's",
    whos: "who's",
    wont: "won't",
    wouldve: "would've",
    wouldnt: "wouldn't",
    youre: "you're",
    its: "it's",
    ill: "i'll"
};

const correctionPattern = new RegExp(`\\b(${Object.keys(corrections).join("|")})\\b`, "gi");

function formatText(text: string, pattern?: string) {
    if (!text || text.length === 0) return text;
    if (/^https?:\/\//i.test(text.trim())) return text;

    let result = text[0].toUpperCase() + text.slice(1);

    if (pattern) {
        result = "";
        for (let i = 0, j = 0; i < text.length; i++) {
            const c = text[i];
            if (c === "'") { result += c; continue; }
            if (j >= pattern.length) { result += c; continue; }
            result += pattern[j] === pattern[j].toUpperCase() ? c.toUpperCase() : c.toLowerCase();
            j++;
        }
    }

    return result;
}

function apply(msg: string) {
    if (settings.store.contractions) {
        msg = msg.replace(correctionPattern, match => formatText(corrections[match.toLowerCase()] || match, match));
    }

    if (settings.store.capitalization) {
        msg = formatText(msg);
    }

    return msg;
}

export default definePlugin({
    name: "AutoCorrect",
    description: "Automatically corrects your messages, for specific messsages use TextReplace plugin",
    authors: [Devs.Velocity],
    settings: settings,

    onBeforeMessageSend(channelId, msg) {
        msg.content = apply(msg.content);
    }
});
