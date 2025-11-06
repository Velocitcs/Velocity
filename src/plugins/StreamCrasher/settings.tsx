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

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { updateStream } from "./utils";

const settings = definePluginSettings({
    isEnabled: {
        type: OptionType.BOOLEAN,
        description: "Crashing state",
        default: false,
        onChange: () => updateStream(settings.store.isEnabled)
    },
    showChevron: {
        type: OptionType.BOOLEAN,
        description: "Show dropdown chevron (options menu)",
        default: true
    },
    keybindEnabled: {
        type: OptionType.BOOLEAN,
        description: "Having the ability to toggle the crasher with a keybind",
        default: false
    },
    buttonLocation: {
        type: OptionType.RADIO,
        description: "Where to place the crasher button",
        options: [
            { label: "Account Section", value: "account", default: true },
            { label: "Voice Panel", value: "voice" },
            { label: "Streaming Panel", value: "stream" }
        ],
        restartNeeded: true
    },
});

export default settings;
