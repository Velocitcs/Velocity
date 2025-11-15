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
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy, findComponentByCodeLazy, findStoreLazy } from "@webpack";
import { Popout, React, useEffect, useRef, UserStore, useStateFromStores } from "@webpack/common";

import { CrasherContextMenu, StreamCrasherPatch } from "./contextMenu";
import { setLastSourceId, updateStream } from "./utils";

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
        type: OptionType.SELECT,
        description: "Where to place the crasher button",
        options: [
            { label: "Account Section", value: "account", default: true },
            { label: "Voice Panel", value: "voice" },
            { label: "Streaming Panel", value: "stream" }
        ],
        restartNeeded: true
    },
});

const Button = findComponentByCodeLazy(".NONE,disabled:", ".PANEL_BUTTON");
const panelClasses = findByPropsLazy("micButtonParent", "buttonChevron");
const ApplicationStreamingStore = findStoreLazy("ApplicationStreamingStore");

const CrashIcon = ({ isEnabled }) => (
    <svg width="24" height="24" viewBox="0 0 24 24">
        <path
            fill={isEnabled ? "var(--status-danger)" : "currentColor"}
            d="M18.75 6c0 2.08-1.19 3.91-3 4.98V12c0 .83-.67 1.5-1.5 1.5h-4.5c-.83 0-1.5-.67-1.5-1.5v-1.02c-1.81-1.08-3-2.91-3-4.98C5.25 2.69 8.27 0 12 0s6.75 2.69 6.75 6zM9.38 8.25c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm6.75-1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM4.8 15c.3-.6 1-.85 1.6-.55L12 17l5.6-2.55c.6-.3 1.35-.05 1.6.55s.05 1.35-.55 1.6L14.8 18l3.65 1.6c.6.3.85 1 .55 1.6s-1 .85-1.6.55L12 19l-5.6 2.75c-.6.3-1.35.05-1.6-.55s-.05-1.35.55-1.6L9.2 18l-3.65-1.6c-.6-.3-.85-1-.55-1.6z"
        />
    </svg>
);

const ChevronIcon = ({ isEnabled, isShown }) => (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ transform: isShown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
        <path fill={isEnabled ? "var(--status-danger)" : "currentColor"} d="M5.3 9.3a1 1 0 0 1 1.4 0l5.3 5.29 5.3-5.3a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.42Z" />
    </svg>
);

function CrashButton(...props) {
    const buttonRef = useRef(props) as any;
    const { isEnabled, showChevron } = settings.use(["isEnabled", "showChevron"]);
    const isStreaming = useStateFromStores([ApplicationStreamingStore], () => ApplicationStreamingStore.getActiveStreamForUser(UserStore.getCurrentUser()?.id) != null);

    useEffect(() => {
        if (isStreaming && isEnabled) {
            updateStream(isEnabled);
        }
    }, [isStreaming, isEnabled]);

    if (!isStreaming) return null;

    if (!showChevron) {
        return (
            <Button
                tooltipText={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                icon={() => <CrashIcon isEnabled={isEnabled} />}
                role="switch"
                aria-checked={isEnabled}
                redGlow={isEnabled}
                onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
            />
        );
    }

    return (
        <div className={panelClasses.micButtonParent}>
            <Popout
                position="top"
                align="left"
                animation={Popout.Animation.FADE}
                targetElementRef={buttonRef}
                renderPopout={({ closePopout, nudge, setPopoutRef }) => (
                    <div ref={setPopoutRef} style={{ transform: `translateX(${nudge - 35}px)` }}>
                        <CrasherContextMenu closePopout={closePopout} settings={settings} />
                    </div>
                )}
            >
                {(props, { isShown }) => (
                    <>
                        <Button
                            tooltipText={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                            icon={() => <CrashIcon isEnabled={isEnabled} />}
                            className={panelClasses.micButtonWithMenu}
                            role="switch"
                            aria-checked={isEnabled}
                            redGlow={isEnabled}
                            plated={true}
                            onClick={() => settings.store.isEnabled = !settings.store.isEnabled}
                        />
                        <div ref={buttonRef}>
                            <Button
                                {...props}
                                tooltipText="Crasher Options"
                                tooltipShouldShow={!isShown}
                                icon={() => <ChevronIcon isEnabled={isEnabled} isShown={isShown} />}
                                className={`${panelClasses.buttonChevron} ${isShown ? panelClasses.popoutOpen : ""}`}
                                onContextMenu={props.onClick}
                                redGlow={isEnabled}
                                plated={true}
                            />
                        </div>
                    </>
                )}
            </Popout>
        </div>
    );
}

export default definePlugin({
    name: "StreamCrasher",
    description: "Crashes/Freezes your stream in Discord calls when you're screensharing",
    tags: ["StreamFreezer", "ScreenshareCrasher"],
    authors: [Devs.Velocity],
    settings,

    contextMenus: {
        "manage-streams": StreamCrasherPatch(settings)
    },

    start() {
        window.addEventListener("keydown", this.event);
    },

    stop() {
        window.removeEventListener("keydown", this.event);
    },

    flux: {
        MEDIA_ENGINE_SET_GO_LIVE_SOURCE(data) {
            const sourceId = data.settings?.desktopSettings?.sourceId;
            if (sourceId && sourceId !== "") {
                setLastSourceId(sourceId);

                if (settings.store.isEnabled) {
                    updateStream(true);
                }
            }
        }
    },

    patches: [
        {
            find: "#{intl::ACCOUNT_SPEAKING_WHILE_MUTED}",
            replacement: {
                match: /className:\i\.buttons,.{0,50}children:\[/,
                replace: "$&$self.CrashButton(),"
            },
            predicate: () => settings.store.buttonLocation === "account"
        },
        {
            find: ".voiceButtonsContainer",
            replacement: {
                match: /(channel:\i)\}\)\]/,
                replace: "$1}),$self.CrashButton()]"
            },
            predicate: () => settings.store.buttonLocation === "voice"
        },
        {
            find: 'action_type:"link_account"',
            replacement: {
                match: /className:(\i)\.actions,children:\[/,
                replace: "className:$1.actions,children:[$self.CrashButton(),"
            },
            predicate: () => settings.store.buttonLocation === "stream"
        }
    ],

    event(e) {
        if (!settings.store.keybindEnabled) return;
        if (e.code === "F7" && e.type === "keydown" && !e.repeat) {
            settings.store.isEnabled = !settings.store.isEnabled;
        }
    },

    CrashButton: ErrorBoundary.wrap(CrashButton, { noop: true })
});
