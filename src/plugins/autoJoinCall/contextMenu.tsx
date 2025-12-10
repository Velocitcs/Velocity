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

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { CogWheel } from "@components/Icons";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import { CMIconClasses, Menu, React } from "@webpack/common";

export const streamContextMenuPatch: NavContextMenuPatchCallback = children => {
    children.splice(4, 0,
        <Menu.MenuItem
            id="vc-autojoin-settings"
            label="Auto Join Settings"
            icon={() => <CogWheel width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
            action={() => openPluginModal(Velocity.Plugins.plugins.AutoJoinCall)}
        />
    );
};

export function streamEnablingPatch(settings: any): NavContextMenuPatchCallback {
    return children => {
        const { autoStream } = settings.use(["autoStream"]);

        children.splice(2, 0,
            <Menu.MenuSeparator />,
            <Menu.MenuCheckboxItem
                id="vc-stream-checkbox"
                label="Auto Stream"
                checked={autoStream}
                action={() => {
                    settings.store.autoStream = !settings.store.autoStream;
                }}
            />
        );
    };
}
