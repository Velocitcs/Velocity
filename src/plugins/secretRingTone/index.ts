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
    ringtoneOverride: {
        type: OptionType.SELECT,
        description: "Ringtone (incoming calls)",
        options: [
            { label: "Snow Halation", value: "call_ringing_snow_halation", default: true },
            { label: "Beat", value: "call_ringing_beat" },
            { label: "Snowsgiving", value: "call_ringing_snowsgiving" },
            { label: "Halloween", value: "halloween_call_ringing" },
            { label: "Winter", value: "winter_call_ringing" },
            { label: "Default", value: "call_ringing" }
        ],
        restartNeeded: true
    },
    callingSound: {
        type: OptionType.SELECT,
        description: "Calling sound (outgoing calls)",
        options: [
            { label: "Default", value: "call_calling", default: true },
            { label: "Halloween", value: "halloween_call_calling" },
            { label: "Winter", value: "winter_call_calling" }
        ],
        restartNeeded: true
    }
});

export default definePlugin({
    name: "SecretRingToneEnabler",
    description: "Enable secret/seasonal Discord ringtones and calling sounds",
    authors: [Devs.AndrewDLO, Devs.FieryFlames, Devs.RamziAH, Devs.Velocity],
    settings,
    patches: [
        {
            find: '"call_ringing_beat"',
            replacement: {
                match: /500!==\i\(\)\.random\(1,1e3\)\?"call_ringing":\i\(\)\.sample\(\["call_ringing_beat","call_ringing_snow_halation"\]\)/,
                replace: "$self.settings.store.ringtoneOverride"
            }
        },
        {
            find: '.uk)("call_calling",',
            replacement: [
                {
                    match: /(\i)\.uk\)\("call_calling",(\i\.\i)\.getSoundpack\(\)\)/,
                    replace: "$1.uk)($self.settings.store.callingSound,$2.getSoundpack())"
                },
                {
                    match: /(\i)\.uk\)\("call_calling",(\i)\.\i\.getSoundpack\(\)\)/,
                    replace: "$1.uk)($self.settings.store.callingSound,$2.Z.getSoundpack())"
                }
            ]
        }
    ]
});
