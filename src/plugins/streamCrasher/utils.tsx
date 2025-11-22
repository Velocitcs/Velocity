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

import { findByPropsLazy } from "@webpack";
import { ApplicationStreamingStore, OverlayRTCConnectionStore } from "@webpack/common";

export let lastSourceId: string | null = null;

const MediaEngineActions = findByPropsLazy("setGoLiveSource");

export function setLastSourceId(sourceId: string | null) {
    lastSourceId = sourceId;
}

export async function getSourceId(isEnabled: boolean) {
    if (isEnabled) return "";

    if (lastSourceId) {
        return lastSourceId;
    }

    const sources = await DiscordNative.desktopCapture.getDesktopCaptureSources({
        types: ["screen"]
    });
    return sources[0]?.id ?? "default";
}

export async function updateStream(isEnabled: boolean) {
    const isStreaming = ApplicationStreamingStore.getCurrentUserActiveStream() != null;
    if (!isStreaming) return;


    const sourceId = await getSourceId(isEnabled);

    // TODO: get a stable state of the user call so it doesnt jerk with the screenshare
    while (OverlayRTCConnectionStore.getConnectionState() !== "RTC_CONNECTED") {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    MediaEngineActions.setGoLiveSource({
        desktopSettings: {
            sourceId: sourceId,
            sound: false
        },

        qualityOptions: {
            preset: 0,
            resolution: 1080,
            frameRate: 60
        },

        context: "stream"
    });
}
