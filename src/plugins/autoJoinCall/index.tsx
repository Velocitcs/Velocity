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
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";

const VoiceActions = findByPropsLazy("selectVoiceChannel", "disconnect");
const ChannelStore = findByPropsLazy("getChannel", "getDMFromUserId");
const VoiceStateStore = findByPropsLazy("getVoiceStatesForChannel");
const MediaEngineStore = findByPropsLazy("isSelfMute", "setLocalMute");
const ToggleMute = findByPropsLazy("toggleSelfMute");
const ToggleDeafen = findByPropsLazy("toggleSelfDeaf");

const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "Channel ID (works with DM and Guild VC)",
        default: ""
    },
    autoMute: {
        type: OptionType.BOOLEAN,
        description: "Automatically mute on join",
        default: false
    },
    autoDeafen: {
        type: OptionType.BOOLEAN,
        description: "Automatically deafen on join",
        default: false
    }
});

function joinCall(channelId: string) {
    const channel = ChannelStore?.getChannel(channelId);
    if (!channel) return;

    const voiceStates = VoiceStateStore?.getVoiceStatesForChannel(channel);
    if (!voiceStates || Object.keys(voiceStates).length === 0) return;

    try {
        VoiceActions.selectVoiceChannel(channelId);

        try {
            if (settings.store.autoDeafen && ToggleDeafen?.toggleSelfDeaf) {
                ToggleDeafen.toggleSelfDeaf();
            } else if (settings.store.autoMute) {
                if (ToggleMute?.toggleSelfMute) {
                    ToggleMute.toggleSelfMute();
                } else if (MediaEngineStore?.setLocalMute) {
                    MediaEngineStore.setLocalMute(true);
                }
            }
        } catch (err) { }
    } catch (e) { }
}

export default definePlugin({
    name: "autoJoinCall",
    description: "Automatically joins the specified DM or guild call",
    authors: [Devs.Velocity],
    settings,

    flux: {
        CALL_CREATE(data: { channelId: string; }) {
            const { channelId } = settings.store;
            if (!channelId) return;

            if (data.channelId === channelId) {
                setTimeout(() => joinCall(channelId), 100);
            }
        }
    },

    start() {
        const { channelId } = settings.store;
        if (!channelId) return;

        joinCall(channelId);
    }
});
// 7900f5

// - Founder of GreatBot 👑

// the era of **//e bloxburg** comes back

//* *GreatBot Support Server**
// https://discord.gg/dvTE7gXanj
// r̶etB̶o̵t̴ ̷s̴in̶e̵ ̶2̴0̸2̶4/ //e quit
// ୧ ‧₊˚ RoScripter999 ·
