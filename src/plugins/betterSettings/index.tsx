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
import { classNameFactory, disableStyle, enableStyle } from "@api/Styles";
import * as Icons from "@components/Icons";
import { buildPluginMenuEntries, buildThemeMenuEntries } from "@plugins/velocityToolbox/menu";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";
import { waitFor } from "@webpack";
import { ComponentDispatch, FocusLock, Menu, useEffect, useRef } from "@webpack/common";
import type { HTMLAttributes, ReactElement } from "react";

import fullHeightStyle from "./fullHeightContext.css?managed";

type SettingsEntry = { section: string, label: string; };

const cl = classNameFactory("");
let Classes: Record<string, string>;
waitFor(["animating", "baseLayer", "bg", "layer", "layers"], m => Classes = m);

const settings = definePluginSettings({
    settingsIcons: {
        description: "Organizes the settings panel with icons",
        type: OptionType.BOOLEAN,
        default: false,
        restartNeeded: true
    },
    disableFade: {
        description: "Disable the crossfade animation",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    },
    organizeMenu: {
        description: "Organizes the settings cog context menu into categories",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    },
    eagerLoad: {
        description: "Removes the loading delay when opening the menu for the first time",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
    }
});

interface TransformedSettingsEntry {
    section: string;
    items: SettingsEntry[];
}

interface LayerProps extends HTMLAttributes<HTMLDivElement> {
    mode: "SHOWN" | "HIDDEN";
    baseLayer?: boolean;
}

function Layer({ mode, baseLayer = false, ...props }: LayerProps) {
    const hidden = mode === "HIDDEN";
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => () => {
        ComponentDispatch.dispatch("LAYER_POP_START");
        ComponentDispatch.dispatch("LAYER_POP_COMPLETE");
    }, []);

    const node = (
        <div
            ref={containerRef}
            aria-hidden={hidden}
            className={cl({
                [Classes.layer]: true,
                [Classes.baseLayer]: baseLayer,
                "stop-animations": hidden
            })}
            style={{ opacity: hidden ? 0 : undefined }}
            {...props}
        />
    );

    return baseLayer
        ? node
        : <FocusLock containerRef={containerRef}>{node}</FocusLock>;
}

export default definePlugin({
    name: "BetterSettings",
    description: "Enhances your settings-menu-opening experience",
    authors: [Devs.Kyuuhachi],
    settings,

    start() {
        if (settings.store.organizeMenu)
            enableStyle(fullHeightStyle);
    },

    stop() {
        disableStyle(fullHeightStyle);
    },

    patches: [
        {
            find: "SEARCH_NO_RESULTS]:{section:",
            replacement: [
                {
                    match: /\[eP\.s6\.(\w+)\]:\{(section:|searchableTitles:|label:|ariaLabel:)/g,
                    replace: (match, key, prop) => {

                        const iconMap = {
                            ACCOUNT: "UserIcon", PROFILE_CUSTOMIZATION: "BikeIcon",
                            CONTENT_SOCIAL: "SocialIcon",
                            DATA_PRIVACY: "PrivacyIcon",
                            PRIVACY_FAMILY_CENTER: "FamilyIcon",
                            THIRD_PARTY_ACCESS: "DiscoverIcon",
                            AUTHORIZED_APPS: "AppsIcon",
                            SESSIONS: "DeviceIcon",
                            CONNECTIONS: "ConnectionsIcon",
                            CHANGELOG: "InfoIcon",
                            MERCHANDISE: "ShopIcon",
                            GUILD_BOOSTING: "BoostIcon",
                            GIFT_INVENTORY: "GiftIcon",
                            BILLING: "BillingIcon",
                            APPEARANCE: "AppearanceIcon",
                            GAMES: "GameOverlayIcon",
                            ACCESSIBILITY: "AccessibilityIcon",
                            VOICE_AND_VIDEO: "Microphone",
                            CHAT: "ChatIcon",
                            NOTIFICATIONS: "NotificationsIcon",
                            KEYBINDS: "KeyboardIcon",
                            LANGUAGE: "LanguageIcon",
                            WINDOW_SETTINGS: "ScreenshareIcon",
                            LINUX_SETTINGS: "ScreenshareIcon",
                            STREAMER_MODE: "StreamerModeIcon",
                            SETTINGS_ADVANCED: "MoreIcon",
                            ACTIVITY_PRIVACY: "UserGameIcon",
                            REGISTERED_GAMES: "ControlerIcon",
                            OVERLAY: "GameOverlayIcon",
                            EXPERIMENTS: "PotionIcon",
                            DEVELOPER_OPTIONS: "DevOptionsIcon"
                        };

                        const icon = iconMap[key];
                        return icon ? `[eP.s6.${key}]:{icon:$self.getIcon('${icon}'),${prop}` : match;
                    }
                },
                {
                    match: /(\[.{1,10}\.SUBSCRIPTIONS\]:\{[\s\S]*?element:\s*.{1,10}\.Z[\s\S]*?icon:\s*.{1,10}\s*\?[\s\S]*?null[\s\S]*?)\}/,
                    replace: "$1,icon:$self.getIcon('SubscriptionsIcon')}"
                },
                {
                    match: /(\[.{1,10}\.CLIPS\]:\{[\s\S]*?url:\s*.{1,20}\.SETTINGS\("clips"\)[\s\S]*?)\}/,
                    replace: "$1,icon:$self.getIcon('ClipsIcon')}"
                },
                {
                    match: /predicate:\s*\(\)\s*=>\s*\w+[\w.]*,/g,
                    replace: ""
                }
            ]
        },
        {
            find: "this.renderArtisanalHack()",
            replacement: [
                { // Fade in on layer
                    match: /(?<=\((\i),"contextType",\i\.\i\);)/,
                    replace: "$1=$self.Layer;",
                    predicate: () => settings.store.disableFade
                },
                { // Lazy-load contents
                    match: /createPromise:\(\)=>([^:}]*?),webpackId:"?\d+"?,name:(?!="CollectiblesShop")"[^"]+"/g,
                    replace: "$&,_:$1",
                    predicate: () => settings.store.eagerLoad
                }
            ]
        },
        { // For some reason standardSidebarView also has a small fade-in
            find: 'minimal:"contentColumnMinimal"',
            replacement: [
                {
                    match: /(?=\(0,\i\.\i\)\((\i),\{from:\{position:"absolute")/,
                    replace: "(_cb=>_cb(void 0,$1))||"
                },
                {
                    match: /\i\.animated\.div/,
                    replace: '"div"'
                }
            ],
            predicate: () => settings.store.disableFade
        },
        { // Load menu TOC eagerly
            find: "#{intl::USER_SETTINGS_WITH_BUILD_OVERRIDE}",
            replacement: {
                match: /(\i)\(this,"handleOpenSettingsContextMenu",.{0,100}?null!=\i&&.{0,100}?(await [^};]*?\)\)).*?,(?=\1\(this)/,
                replace: "$&(async ()=>$2)(),"
            },
            predicate: () => settings.store.eagerLoad
        },
        {
            // Settings cog context menu
            find: "#{intl::USER_SETTINGS_ACTIONS_MENU_LABEL}",
            replacement: [
                {
                    match: /=\[\];if\((\i)(?=\.forEach.{0,100}"logout"!==\i.{0,30}(\i)\.get\(\i\))/,
                    replace: "=$self.wrapMap([]);if($self.transformSettingsEntries($1,$2)",
                    predicate: () => settings.store.organizeMenu
                },
                {
                    match: /case \i\.\i\.DEVELOPER_OPTIONS:return \i;/,
                    replace: "$&case 'VelocityPlugins':return $self.buildPluginMenuEntries(true);$&case 'VelocityThemes':return $self.buildThemeMenuEntries();"
                }
            ]
        },
    ],

    getIcon(name = "PlaceholderIcon") {
        const IconComponent = Icons[name] || Icons.PlaceholderIcon;
        const isDefault = name === "PlaceholderIcon" || !Icons[name];

        return (
            <IconComponent
                viewBox="0 0 24 24"
                width={isDefault ? 24 : 18}
                height={isDefault ? 24 : 18}
            />
        );
    },



    buildPluginMenuEntries,
    buildThemeMenuEntries,

    // This is the very outer layer of the entire ui, so we can't wrap this in an ErrorBoundary
    // without possibly also catching unrelated errors of children.
    //
    // Thus, we sanity check webpack modules
    Layer(props: LayerProps) {
        try {
            [FocusLock.$$velocityGetWrappedComponent(), ComponentDispatch, Classes].forEach(e => e.test);
        } catch {
            new Logger("BetterSettings").error("Failed to find some components");
            return props.children;
        }

        return <Layer {...props
        } />;
    },

    transformSettingsEntries(list: SettingsEntry[], keyMap: Map<string, string>) {
        const items = [] as TransformedSettingsEntry[];

        for (const item of list) {
            if (item.section === "HEADER") {
                keyMap.set(item.label, item.label);
                items.push({ section: item.label, items: [] });
            } else if (item.section !== "DIVIDER" && keyMap.has(item.section)) {
                items.at(-1)?.items.push(item);
            }
        }

        return items;
    },

    wrapMap(toWrap: any[]) {
        // @ts-expect-error
        toWrap.map = function (render: (item: SettingsEntry) => ReactElement<any>) {
            const result: any[] = [];

            this
                .filter(a => a.items.length > 0)
                .forEach(({ section, items }: any) => {
                    const children = items.map((item: SettingsEntry) => render(item)).filter(Boolean);

                    if (section) {
                        result.push(
                            <Menu.MenuItem
                                key={section}
                                id={section.replace(/\W/, "_")}
                                label={section}
                            >
                                {children}
                            </Menu.MenuItem>
                        );
                    } else {
                        result.push(...children);
                    }
                });

            return result;
        };

        return toWrap;
    }
});
