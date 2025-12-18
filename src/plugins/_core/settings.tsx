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

import { definePluginSettings, Settings } from "@api/Settings";
import { BackupRestoreIcon, CloudIcon, CogWheel, DevOptionsIcon, HelpersIcon, PaintbrushIcon, PluginsIcon, UpdaterIcon } from "@components/Icons";
import { BackupAndRestoreTab, CloudTab, DeveloperTab, PatchHelperTab, PluginsTab, ThemesTab, UpdaterTab, VelocityTab } from "@components/settings/tabs";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import { isTruthy } from "@utils/guards";
import definePlugin, { IconProps, OptionType } from "@utils/types";
import { waitFor } from "@webpack";
import { React } from "@webpack/common";
import { ComponentType, ReactNode } from "react";

import gitHash from "~git-hash";

let LayoutTypes = {
    SECTION: 1,
    SIDEBAR_ITEM: 2,
    PANEL: 3,
    PANE: 4
};
waitFor(["SECTION", "SIDEBAR_ITEM", "PANEL"], v => LayoutTypes = v);

const FallbackSectionTypes = {
    HEADER: "HEADER",
    DIVIDER: "DIVIDER",
    CUSTOM: "CUSTOM"
};
type SectionTypes = typeof FallbackSectionTypes;

type SettingsLocation =
    | "top"
    | "aboveNitro"
    | "belowNitro"
    | "aboveActivity"
    | "belowActivity"
    | "bottom";

interface SettingsLayoutNode {
    type: number;
    key?: string;
    legacySearchKey?: string;
    getLegacySearchKey?(): string;
    useLabel?(): string;
    useTitle?(): string;
    buildLayout?(): SettingsLayoutNode[];
    icon?(): ReactNode;
    render?(): ReactNode;
    StronglyDiscouragedCustomComponent?(): ReactNode;
}

interface EntryOptions {
    key: string,
    title: string,
    panelTitle?: string,
    Component: ComponentType<{}>,
    Icon: ComponentType<IconProps>;
}
interface SettingsLayoutBuilder {
    key?: string;
    buildLayout(): SettingsLayoutNode[];
}

const settings = definePluginSettings({
    settingsLocation: {
        type: OptionType.SELECT,
        description: "Where to put the Velocity settings section",
        options: [
            { label: "At the very top", value: "top" },
            { label: "Above the Nitro section", value: "aboveNitro", default: true },
            { label: "Below the Nitro section", value: "belowNitro" },
            { label: "Above Activity Settings", value: "aboveActivity" },
            { label: "Below Activity Settings", value: "belowActivity" },
            { label: "Above Appearance", value: "aboveAppearance" },
            { label: "Below Appearance", value: "belowAppearance" },
            { label: "Above Accessibility", value: "aboveAccessibility" },
            { label: "Below Accessibility", value: "belowAccessibility" },
            { label: "At the very bottom", value: "bottom" },
        ]
    },
    disableNewUI: {
        type: OptionType.BOOLEAN,
        description: "Force Discord to use the old settings UI",
        default: false,
        restartNeeded: true
    }
});

export default definePlugin({
    name: "Settings",
    description: "Adds Settings UI and debug info",
    authors: [Devs.Velocity],
    required: true,
    settings: settings,

    patches: [
        {
            find: ".versionHash",
            replacement: [
                {
                    match: /\.info.+?\[\(0,\i\.jsxs?\)\((.{1,10}),(\{[^{}}]+\{.{0,20}.versionHash,.+?\})\)," "/,
                    replace: (m, component, props) => {
                        props = props.replace(/children:\[.+\]/, "");
                        return `${m},$self.makeInfoElements(${component}, ${props})`;
                    }
                },
                {
                    match: /(null!=\i&&(\i)\.push\(\i\),)/,
                    replace: "$1$2.push(...$self.getInfoRows()),"
                },
                {
                    match: /(null!=C&&\(0,r\.jsx\)\(l\.Text,\{tag:"span",variant:"text-xxs\/normal",color:"text-muted",children:\(0,r\.jsxs\)\("span",\{className:m\.versionHash,children:\["Build Override: ",C\.id\]\}\)\}\))/,
                    replace: "$1,$self.getInfoRows().map((text,i)=>(0,r.jsx)(l.Text,{key:'vc'+i,tag:'span',variant:'text-xxs/normal',color:'text-muted',children:text}))"
                }
            ]
        },
        {
            find: ".SEARCH_NO_RESULTS&&0===",
            replacement: [
                {
                    match: /(?<=section:(.{0,50})\.DIVIDER\}\))([,;])(?=.{0,200}(\i)\.push.{0,100}label:(\i)\.header)/,
                    replace: (_, sectionTypes, commaOrSemi, elements, element) => `${commaOrSemi} $self.addSettings(${elements}, ${element}, ${sectionTypes}) ${commaOrSemi}`
                },
                {
                    match: /({(?=.+?function (\i).{0,160}(\i)=\i\.useMemo.{0,140}return \i\.useMemo\(\(\)=>\i\(\3).+?\(\)=>)\2/,
                    replace: (_, rest, settingsHook) => `${rest}$self.wrapSettingsHook(${settingsHook})`
                }
            ]
        },
        {
            find: "#{intl::USER_SETTINGS_ACTIONS_MENU_LABEL}",
            replacement: {
                // Skip the check Discord performs to make sure the section being selected in the user settings context menu is valid
                match: /(?<=function\((\i),(\i),\i\)\{)(?=let \i=Object.values\(\i\.\i\).+?(\(0,\i\.openUserSettings\))\()/,
                replace: (_, settingsPanel, section, openUserSettings) => `${openUserSettings}(${settingsPanel},{section:${section}});return;`
            }
        },
        {
            find: ".buildLayout().map",
            replacement: {
                match: /(\i)\.buildLayout\(\)(?=\.map)/,
                replace: "$self.buildLayout($1)"
            }
        },
        {
            find: "2025-09-user-settings-redesign-1",
            replacement: {
                match: /enabled:![01],showLegacyOpen:/g,
                replace: (m: string) =>
                    settings.store.disableNewUI
                        ? "enabled:false,showLegacyOpen:"
                        : m
            }
        },

        {
            find: "getWebUserSettingFromSection",
            replacement: {
                match: /new Map\(\[(?=\[.{0,10}\.ACCOUNT,.{0,10}\.ACCOUNT_PANEL)/,
                replace: "new Map([...$self.getSettingsSectionMappings(),"
            }
        }
    ],

    buildEntry(options: EntryOptions): SettingsLayoutNode {
        const { key, title, panelTitle = title, Component, Icon } = options;

        const panel: SettingsLayoutNode = {
            key: key + "_panel",
            type: LayoutTypes.PANEL,
            useTitle: () => panelTitle,
        };

        const render = {
            // FIXME
            StronglyDiscouragedCustomComponent: () => <Component />,
            render: () => <Component />,
        };

        // FIXME
        if (LayoutTypes.PANE) {
            panel.buildLayout = () => [
                {
                    key: key + "_pane",
                    type: LayoutTypes.PANE,
                    useTitle: () => panelTitle,
                    buildLayout: () => [],
                    ...render
                }
            ];
        } else {
            Object.assign(panel, render);
            panel.buildLayout = () => [];
        }

        return ({
            key,
            type: LayoutTypes.SIDEBAR_ITEM,
            // FIXME
            legacySearchKey: title.toUpperCase(),
            getLegacySearchKey: () => title.toUpperCase(),
            useTitle: () => title,
            icon: () => <Icon width={20} height={20} />,
            buildLayout: () => [panel]
        });
    },

    getSettingsSectionMappings() {
        return [
            ["VelocitySettings", "velocity_main_panel"],
            ["VelocityPlugins", "velocity_plugins_panel"],
            ["VelocityThemes", "velocity_themes_panel"],
            ["VelocityUpdater", "velocity_updater_panel"],
            ["VelocityCloud", "velocity_cloud_panel"],
            ["VelocityBackupAndRestore", "velocity_backup_restore_panel"],
            ["VelocityDeveloper", "velocity_developer_tools_panel"],
            ["VelocityHelpers", "velocity_helpers_panel"]
        ];
    },

    buildLayout(originalLayoutBuilder: SettingsLayoutBuilder) {
        const layout = originalLayoutBuilder.buildLayout();
        if (originalLayoutBuilder.key !== "$Root") return layout;
        if (!Array.isArray(layout)) return layout;

        if (layout.some(s => s?.key === "velocity_section")) return layout;

        const { buildEntry } = this;

        const velocityEntries: SettingsLayoutNode[] = [
            buildEntry({
                key: "velocity_main",
                title: "Velocity",
                panelTitle: "Velocity Settings",
                Component: VelocityTab,
                Icon: CogWheel
            }),
            buildEntry({
                key: "velocity_plugins",
                title: "Plugins",
                Component: PluginsTab,
                Icon: PluginsIcon
            }),
            buildEntry({
                key: "velocity_themes",
                title: "Themes",
                Component: ThemesTab,
                Icon: PaintbrushIcon
            }),
            !IS_UPDATER_DISABLED && UpdaterTab && buildEntry({
                key: "velocity_updater",
                title: "Updater",
                panelTitle: "Velocity Updater",
                Component: UpdaterTab,
                Icon: UpdaterIcon
            }),
            buildEntry({
                key: "velocity_cloud",
                title: "Cloud",
                panelTitle: "Velocity Cloud",
                Component: CloudTab,
                Icon: CloudIcon
            }),
            buildEntry({
                key: "velocity_backup_restore",
                title: "Backup & Restore",
                Component: BackupAndRestoreTab,
                Icon: BackupRestoreIcon
            }),
            IS_DEV && DeveloperTab && buildEntry({
                key: "velocity_developer_tools",
                title: "Developer Tools",
                Component: DeveloperTab,
                Icon: DevOptionsIcon
            }),
            IS_DEV && PatchHelperTab && buildEntry({
                key: "velocity_helper",
                title: "Helpers",
                Component: PatchHelperTab,
                Icon: HelpersIcon
            }),
            ...this.customEntries.map(buildEntry)
        ].filter(isTruthy);

        const velocitySection = {
            key: "velocity_section",
            type: LayoutTypes.SECTION,
            useTitle: () => "Velocity Settings",
            buildLayout: () => velocityEntries
        };

        const { settingsLocation } = settings.store;

        const places: Record<SettingsLocation, string> = {
            top: "user_section",
            aboveNitro: "billing_section",
            belowNitro: "billing_section",
            aboveActivity: "activity_section",
            belowActivity: "activity_section",
            bottom: "logout_section"
        };

        const key = places[settingsLocation] ?? places.top;
        let idx = layout.findIndex(s => typeof s?.key === "string" && s.key === key);

        if (idx === -1) {
            idx = 2;
        } else if (settingsLocation.startsWith("below")) {
            idx += 1;
        }

        layout.splice(idx, 0, velocitySection);

        return layout;
    },

    customEntries: [] as EntryOptions[],

    makeSettingsCategories(SectionTypes: SectionTypes): Record<string, unknown>[] {
        const showIcons = Settings.plugins.BetterSettings.settingsIcons;
        const categories = [
            {
                section: SectionTypes.HEADER,
                label: "Velocity"
            },
            {
                section: "VelocitySettings",
                label: "Velocity",
                element: VelocityTab,
                icon: showIcons ? <CogWheel height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-settings"
            },
            {
                section: "VelocityPlugins",
                label: "Plugins",
                element: PluginsTab,
                icon: showIcons ? <PluginsIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-plugins"
            },
            {
                section: "VelocityThemes",
                label: "Themes",
                element: ThemesTab,
                icon: showIcons ? <PaintbrushIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-themes"
            },
            !IS_UPDATER_DISABLED && {
                section: "VelocityUpdater",
                label: "Updater",
                element: UpdaterTab,
                icon: showIcons ? <UpdaterIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-updater",
            },
            {
                section: "VelocityCloud",
                label: "Cloud",
                element: CloudTab,
                icon: showIcons ? <CloudIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-cloud"
            },
            {
                section: "VelocityBackupAndRestore",
                label: "Backup & Restore",
                element: BackupAndRestoreTab,
                icon: showIcons ? <BackupRestoreIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-backup-restore"
            },
            IS_DEV && {
                section: "VelocityDeveloper",
                label: "Developer Tools",
                element: DeveloperTab,
                icon: showIcons ? <DevOptionsIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-developer"
            },
            IS_DEV && {
                section: "VelocityHelpers",
                label: "Helpers",
                element: PatchHelperTab,
                icon: showIcons ? <HelpersIcon height="18" width="18" viewBox="0 0 24 24" /> : null,
                className: "vc-helpers"
            },
            {
                section: SectionTypes.DIVIDER
            }
        ];

        return categories.filter(Boolean) as Record<string, unknown>[];
    },

    isRightSpot({ header, settings }: { header?: string; settings?: string[]; }) {
        const firstChild = settings?.[0];
        if (firstChild === "LOGOUT" || firstChild === "SOCIAL_LINKS") return true;

        const { settingsLocation } = Settings.plugins.Settings;

        if (settingsLocation === "bottom") return firstChild === "LOGOUT";
        if (settingsLocation === "belowActivity") return firstChild === "CHANGELOG";
        if (settingsLocation === "belowAppearance") return firstChild === "ACCESSIBILITY";
        if (settingsLocation === "belowAccessibility") return firstChild === "VOICE";

        if (!header) return;

        try {
            const names = {
                top: getIntlMessage("USER_SETTINGS"),
                aboveNitro: getIntlMessage("BILLING_SETTINGS"),
                belowNitro: getIntlMessage("APP_SETTINGS"),
                aboveActivity: getIntlMessage("ACTIVITY_SETTINGS"),
                aboveAppearance: "Appearance",
                aboveAccessibility: "Accessibility"
            };

            if (!names[settingsLocation] || names[settingsLocation].endsWith("_SETTINGS"))
                return firstChild === "PREMIUM";

            return header === names[settingsLocation];
        } catch {
            return firstChild === "PREMIUM";
        }
    },

    patchedSettings: new WeakSet(),

    addSettings(elements: any[], element: { header?: string; settings: string[]; }, sectionTypes: SectionTypes) {
        if (this.patchedSettings.has(elements) || !this.isRightSpot(element)) return;

        this.patchedSettings.add(elements);

        elements.push(...this.makeSettingsCategories(sectionTypes));
    },
    wrapSettingsHook(originalHook: (...args: any[]) => Record<string, unknown>[]) {
        return (...args: any[]) => {
            const elements = originalHook(...args);
            if (!this.patchedSettings.has(elements))
                elements.unshift(...this.makeSettingsCategories({
                    HEADER: "HEADER",
                    DIVIDER: "DIVIDER",
                    CUSTOM: "CUSTOM"
                }).filter(Boolean));

            return elements;
        };
    },

    get electronVersion() {
        return VelocityNative.native.getVersions().electron || window.legcord?.electron || null;
    },


    get chromiumVersion() {
        try {
            return VelocityNative.native.getVersions().chrome
                // @ts-expect-error Typescript will add userAgentData IMMEDIATELY
                || navigator.userAgentData?.brands?.find(b => b.brand === "Chromium" || b.brand === "Google Chrome")?.version
                || null;
        } catch { // inb4 some stupid browser throws unsupported error for navigator.userAgentData, it's only in chromium
            return null;
        }
    },

    get additionalInfo() {
        if (IS_DEV) return " (Dev)";
        if (IS_STANDALONE) return " (Standalone)";
        return "";
    },

    getInfoRows() {
        const { electronVersion, chromiumVersion, additionalInfo } = this;

        const rows = [`Velocity ${gitHash}${additionalInfo}`];

        if (electronVersion) rows.push(`Electron ${electronVersion}`);
        if (chromiumVersion) rows.push(`Chromium ${chromiumVersion}`);

        return rows;
    },

    getInfoString() {
        return "\n" + this.getInfoRows().join("\n");
    },

    makeInfoElements(Component: React.ComponentType<React.PropsWithChildren>, props: React.PropsWithChildren) {
        return this.getInfoRows().map((text, i) =>
            <Component key={i} {...props}>{text}</Component>
        );
    }
});
