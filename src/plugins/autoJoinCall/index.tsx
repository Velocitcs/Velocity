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

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { CogWheel } from "@components/Icons";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import { Devs } from "@utils/constants";
import { Iconclasses, setIconClassName } from "@utils/icon";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { FluxDispatcher, FormNotice, Menu, React, Select } from "@webpack/common";

const VoiceActions = findByPropsLazy("selectVoiceChannel", "disconnect");
const ChannelStore = findByPropsLazy("getChannel", "getDMFromUserId");
const VoiceStateStore = findByPropsLazy("getVoiceStatesForChannel");
const MediaEngineStore = findByPropsLazy("isSelfMute", "setLocalMute");
const ToggleMute = findByPropsLazy("toggleSelfMute");
const ToggleDeafen = findByPropsLazy("toggleSelfDeaf");

const settings = definePluginSettings({
    channelId: {
        type: OptionType.STRING,
        description: "Channel IDs (comma separated for multiple channels)",
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
        type: OptionType.STRING,
        description: "Stream source ID",
        default: "screen:0:0",
        hidden: true
    },
    streamSourcePicker: {
        type: OptionType.COMPONENT,
        description: "",
        component: () => {
            const [sources, setSources] = React.useState<{ label: string; value: string; }[]>([]);
            const [selected, setSelected] = React.useState(settings.store.streamSource || "screen:0:0");

            React.useEffect(() => {
                (async () => {
                    try {
                        const srcs = await DiscordNative.desktopCapture.getDesktopCaptureSources({
                            types: ["screen"]
                        });
                        setSources(
                            srcs.map((s: any, index: number) => ({
                                label: `Screen ${index + 1}`,
                                value: s.id
                            }))
                        );
                    } catch (err) {
                        console.error("Failed to load sources:", err);
                    }
                })();
            }, []);

            return (
                <>
                    <Select
                        options={sources}
                        isSelected={v => v === selected}
                        select={v => {
                            setSelected(v);
                            settings.store.streamSource = v;
                        }}
                        serialize={v => v}
                    />
                </>
            );
        }
    }
});

async function startStream(channelId: string) {
    await new Promise(r => setTimeout(r, 500));

    const sourceId = settings.store.streamSource;

    console.log("Streaming with sourceId:", sourceId);

    FluxDispatcher.dispatch({
        type: "STREAM_START",
        streamType: "call",
        channelId: channelId,
        sourceId: sourceId,
        sound: settings.store.streamSound
    });
}

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

            if (settings.store.autoStream) {
                startStream(channelId);
            }
        } catch (err) { }
    } catch (e) { }
}

function getChannelIds(): string[] {
    const { channelId } = settings.store;
    if (!channelId) return [];
    return channelId.split(",").map(id => id.trim()).filter(id => id.length > 0);
}

const streamContextMenuPatch: NavContextMenuPatchCallback = children => {
    const menuItem = (
        <Menu.MenuItem
            id="vc-autojoin-settings"
            label="Auto Join Settings"
            icon={setIconClassName(CogWheel, Iconclasses.discord)}
            action={() => openPluginModal(Velocity.Plugins.plugins.autoJoinCall)}
        />
    );

    children.splice(4, 0, menuItem);
};


const streamEnablingPatch: NavContextMenuPatchCallback = children => {
    const menuItem = (
        <Menu.MenuCheckboxItem
            id="vc-stream-checkbox"
            label="Auto Stream"
            subtext="Whether to automaticly start a stream thru AutoJoinCall plugin"
            checked={settings.store.autoStream}
            action={() => {
                settings.store.autoStream = !settings.store.autoStream;
            }}
        />
    );

    children.splice(2, 0, menuItem);
};
export default definePlugin({
    name: "autoJoinCall",
    description: "Automatically joins the specified DM or guild call(s)",
    authors: [Devs.Velocity],
    settings,

    contextMenus: {
        "more-settings-context": streamContextMenuPatch,
        "manage-streams": streamEnablingPatch
    },

    flux: {
        CALL_CREATE(data: { channelId: string; }) {
            const channelIds = getChannelIds();
            if (channelIds.length === 0) return;

            if (channelIds.includes(data.channelId)) {
                setTimeout(() => joinCall(data.channelId), 100);
            }
        }
    },

    start() {
        const channelIds = getChannelIds();
        if (channelIds.length === 0) return;

        channelIds.forEach(id => joinCall(id));
    },

    settingsAboutComponent: () => (
        <>
            <FormNotice
                messageType="danger"
                textColor="text-feedback-danger"
            >
                This will force your streams to the selected screen no matter what (only if StreamCrasher is enabled)
            </FormNotice>
        </>
    )
});
