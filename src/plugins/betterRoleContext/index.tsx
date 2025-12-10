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
import { getUserSettingLazy } from "@api/UserSettings";
import { AppearanceIcon, ImageIcon, PencilIcon } from "@components/Icons";
import { copyToClipboard } from "@utils/clipboard";
import { Devs } from "@utils/constants";
import { getCurrentGuild } from "@utils/discord";
import { ModalAPI } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import type { Guild, Role } from "@velocity-types";
import { findByPropsLazy } from "@webpack";
import { CMIconClasses, GuildRoleStore, Menu, PermissionStore } from "@webpack/common";
import type { ReactElement } from "react";

const GuildSettingsActions = findByPropsLazy("open", "selectRole", "updateGuild");

const DeveloperMode = getUserSettingLazy("appearance", "developerMode")!;

function NameIcon() {
    return (
        <svg
            role="img"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
        </svg>
    );
}

const copyableRoleProperties = [
    {
        key: "colorString",
        id: "vc-copy-role-color",
        name: "Copy Role Color",
        icon: () => <AppearanceIcon viewBox="0 0 24 24" height="18" width="18" className={CMIconClasses.icon} />,
        value: (role: Role) => (!role.colorStrings.primaryColor || !role.colorStrings.secondaryColor) && role.colorString,
    },
    {
        key: "colorString",
        id: "vc-copy-role-color",
        name: "Copy Role Gradient Color",
        icon: () => <AppearanceIcon viewBox="0 0 24 24" height="18" width="18" className={CMIconClasses.icon} />,
        value: (role: Role) => role.colorStrings.primaryColor && role.colorStrings.secondaryColor && `${role.colorStrings.primaryColor} ${role.colorStrings.secondaryColor}`,
    },
    {
        key: "name",
        id: "vc-copy-role-name",
        name: "Copy Role Name",
        icon: NameIcon,
        value: (role: Role) => role.name,
    },
    {
        id: "vc-copy-role-icon-url",
        name: "Copy Role Icon URL",
        icon: () => <ImageIcon viewBox="0 0 24 24" height="18" width="18" className={CMIconClasses.icon} />,
        value: (role: Role) => role.icon && `${location.protocol}//${window.GLOBAL_ENV.CDN_HOST}/role-icons/${role.id}/${role.icon}.${settings.store.roleIconFileFormat}`,
    }
];

export const patchRoleContextMenu = (
    children: (ReactElement<any> | null)[],
    role: Role,
    editRoleGuildId?: string
) => {
    const contextItems = copyableRoleProperties.reduce((acc, propertyInfo) => {
        const propertyValue = propertyInfo.value(role);

        if (propertyValue)
            acc.push(
                <Menu.MenuItem
                    id={propertyInfo.id}
                    label={propertyInfo.name}
                    icon={propertyInfo.icon}
                    action={() => copyToClipboard(propertyValue)}
                />
            );

        return acc;
    }, [] as React.ReactElement[]);

    if (editRoleGuildId) {
        contextItems.push(
            <Menu.MenuItem
                id="vc-edit-role"
                label="Edit Role"
                icon={() => PencilIcon({ width: 18, height: 18, viewBox: "0 0 24 24" })}
                action={async () => {
                    ModalAPI.closeModal("vc-permviewer-modal");

                    await GuildSettingsActions.open(editRoleGuildId, "ROLES");
                    GuildSettingsActions.selectRole(role.id);
                }}
            />
        );
    }

    const viewRawItemIndex = children.findIndex(child => {
        const props = child?.props;

        return !Array.isArray(props) && props?.id === "vc-view-role-raw";
    });

    if (viewRawItemIndex !== -1) {
        contextItems.push(children.splice(viewRawItemIndex, 1)[0]!);
    }

    const copyRoleIdIndex = children.findIndex(child => child?.key?.includes("devmode-copy-id-"));

    children.splice(copyRoleIdIndex !== -1 ? copyRoleIdIndex + 1 : -1, 0, ...contextItems);
};

const settings = definePluginSettings({
    roleIconFileFormat: {
        type: OptionType.SELECT,
        description: "File format to use when viewing role icons",
        options: [
            {
                label: "png",
                value: "png",
                default: true
            },
            {
                label: "webp",
                value: "webp",
            },
            {
                label: "jpg",
                value: "jpg"
            }
        ]
    }
});

export default definePlugin({
    name: "BetterRoleContext",
    description: "Adds options to copy role color / edit role / view role icon when right clicking roles in the user profile",
    authors: [Devs.Ven, Devs.goodbee],
    dependencies: ["UserSettingsAPI"],

    settings,

    start() {
        // DeveloperMode needs to be enabled for the context menu to be shown
        DeveloperMode.updateSetting(true);
    },

    contextMenus: {
        "vc-permviewer-role-context-menu"(children, { guild, role }: { guild: Guild, role?: Role; }) {
            if (!role) return;

            patchRoleContextMenu(children, role, PermissionStore.getGuildPermissionProps(guild).canManageRoles ? guild.id : undefined
            );
        },
        "guild-settings-role-context"(children, { role }: { role: Role; }) {
            patchRoleContextMenu(children, role);
        },
        "dev-context"(children, { id }: { id: string; }) {
            const guild = getCurrentGuild();
            if (!guild) return;

            const role = GuildRoleStore.getRole(guild.id, id);
            if (!role) return;

            patchRoleContextMenu(children, role, PermissionStore.getGuildPermissionProps(guild).canManageRoles ? guild.id : undefined);
        }
    }
});
