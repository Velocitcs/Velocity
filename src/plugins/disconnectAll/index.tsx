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

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin from "@utils/types";
import { Menu, PermissionsBits, PermissionStore, RestAPI, Toasts, VoiceStateStore } from "@webpack/common";

const disconnectAllPatch: NavContextMenuPatchCallback = (children, props) => {
    if (!props.channel.isGuildVoice()) return;

    const canDisconnect = PermissionStore.can(PermissionsBits.MOVE_MEMBERS, props.channel);
    if (!canDisconnect) return;

    const voiceStates = VoiceStateStore.getVoiceStatesForChannel(props.channel.id);
    if (Object.keys(voiceStates).length === 0) return;

    const group = findGroupChildrenByChildId("hide-voice-names", children) ?? children;

    group.push(
        <>
            <Menu.MenuItem
                id="vc-da-disconnect-all"
                label="Disconnect All"
                action={async () => {
                    let disconnectedCount = 0;
                    for (const userId in voiceStates) {
                        try {
                            await RestAPI.patch({
                                url: `/guilds/${props.channel.guild_id}/members/${userId}`,
                                body: { channel_id: null }
                            });
                            disconnectedCount++;
                        } catch (error) {
                            new Logger("DisconnectAll").error(`Failed to disconnect user ${userId}: `, error);
                        }
                    }
                    if (disconnectedCount > 0) {
                        Toasts.show({
                            message: `Disconnected ${disconnectedCount} users`,
                            id: Toasts.genId(),
                            type: Toasts.Type.SUCCESS
                        });
                    }
                }}
            />
        </>
    );
};

export default definePlugin({
    name: "DisconnectAll",
    description: "Adds a button to disconnect all users from a voice channel.",
    authors: [Devs.Velocity],

    contextMenus: {
        "channel-context": disconnectAllPatch
    }
});
