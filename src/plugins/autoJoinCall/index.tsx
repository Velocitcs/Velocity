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
import { sleep } from "@utils/misc";
import definePlugin, { OptionType } from "@utils/types";
import { filters, findByPropsLazy, mapMangledModuleLazy } from "@webpack";
import { ApplicationStreamingStore, ChannelStore, MediaEngineStore, OverlayRTCConnectionStore, VoiceStateStore } from "@webpack/common";

import { streamContextMenuPatch, streamEnablingPatch } from "./contextMenu";
const VoiceActions = findByPropsLazy("selectVoiceChannel");
const MediaEngineActions = findByPropsLazy("toggleSelfMute", "toggleSelfDeaf");

const { Z: createStream } = mapMangledModuleLazy("startStreamWithSource", {
    Z: filters.byCode("startStreamWithSource")
});
interface Screen {
    icon: string;
    id: string;
    name: string;
    url: string;
}

const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "Check for channel ids",
        default: ""
    },
    voiceSetting: {
        type: OptionType.SELECT,
        description: "Audio state on join",
        restartNeeded: true,
        options: [
            { label: "None", value: "none", default: true },
            { label: "Auto Mute", value: "mute" },
            { label: "Auto Deafen", value: "deafen" }
        ]
    },
    autoStream: {
        type: OptionType.BOOLEAN,
        description: "Automatically start streaming on join",
        default: false
    },
    streamSound: {
        type: OptionType.BOOLEAN,
        description: "Enable sound when streaming",
        default: true
    },
    streamSource: {
        type: OptionType.SELECT,
        description: "Stream source",
        default: "screen:0:0",
        options: async () => {
            const screens = await getScreens("GET_SCREENS");
            return screens.map((screen: Screen, index: number) => ({
                label: `Screen ${index + 1}`,
                value: screen.id
            }));
        }
    }
});

async function getScreens(method: "GET_SCREENS" | "GET_SCREEN_BY_SETTINGS") {
    const screens = await DiscordNative.desktopCapture.getDesktopCaptureSources({
        types: ["screen"]
    });

    if (method === "GET_SCREENS") {
        return screens;
    }
    if (method === "GET_SCREEN_BY_SETTINGS") {
        const streamSourceId = settings.store.streamSource;
        return screens.find((s: Screen) => s.id === streamSourceId) as Screen;
    }
}

async function startStream() {
    if (ApplicationStreamingStore.getCurrentUserActiveStream() != null) return;

    const sourceData = await getScreens("GET_SCREEN_BY_SETTINGS");

    // WARNING: This will always throw an error "Options `sourceId` and `type` are required."
    // because of how the crasher is designed, this will not be fixed or changed
    await createStream(
        {
            id: sourceData.id,
            name: sourceData.name,
            icon: sourceData.icon,

            preset: 0,
            resolution: 1080,
            fps: 60,
            soundshareEnabled: settings.store.streamSound,
            previewDisabled: true,
            analyticsLocations: ["voice control tray"]
        }
    );
}

async function joinCall(channelId: string) {
    const channel = ChannelStore.getChannel(channelId);
    if (!channel) return;

    const voiceStates = VoiceStateStore.getVoiceStatesForChannel(channelId);
    // empty array = call doesnt exist
    if (Object.keys(voiceStates).length === 0) return;

    VoiceActions.selectVoiceChannel(channelId);

    // Waiting here until RTC is connected so discord doesnt freak out
    while (OverlayRTCConnectionStore.getConnectionState() !== "RTC_CONNECTED") {
        await sleep(500);
    }

    const { voiceSetting } = settings.store;

    if (voiceSetting === "deafen") {
        if (!MediaEngineStore.isSelfDeaf()) {
            MediaEngineActions.toggleSelfDeaf();
        }
    } else if (voiceSetting === "mute") {
        if (!MediaEngineStore.isSelfMute()) {
            MediaEngineActions.toggleSelfMute();
        }
    }

    if (settings.store.autoStream) {
        startStream();
    }
}

function getChannelIds(): string[] {
    const { channelId } = settings.store;
    if (!channelId) return [];
    return channelId.split(",").map(id => id.trim()).filter(id => id.length > 0);
}

export default definePlugin({
    name: "AutoJoinCall",
    description: "Automatically joins the specified DM or guild call(s)",
    authors: [Devs.Velocity],
    settings,

    patches: [
        {
            find: "deaf:!",
            replacement: {
                match: /\(a\.mute\|\|a\.deaf\)&&/g,
                replace: "false&&"
            }
        }
    ],

    start() {
        const channelIds = getChannelIds();
        if (channelIds.length === 0) return;

        channelIds.forEach(id => joinCall(id));
    },

    contextMenus: {
        "more-settings-context": streamContextMenuPatch,
        "manage-streams": streamEnablingPatch(settings)
    },

    flux: {
        CALL_CREATE(data: { channelId: string; }) {
            const channelIds = getChannelIds();
            if (channelIds.length === 0) return;

            if (channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        },

        CALL_UPDATE(data: { channelId: string; ringing?: string[]; }) {
            const channelIds = getChannelIds();
            if (channelIds.length === 0) return;

            const isRinging = Array.isArray(data.ringing) && data.ringing.length > 0;

            if (isRinging && channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        }
    }
});
