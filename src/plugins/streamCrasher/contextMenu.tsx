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
import { openPluginModal } from "@components/settings";
import { CMIconClasses, Menu } from "@webpack/common";

export function CrasherContextMenu({ closePopout, settings }) {
    const { isEnabled, keybindEnabled } = settings.use(["isEnabled", "keybindEnabled"]);

    return (
        <Menu.Menu navId="stream-crasher-context" onClose={closePopout}>
            <Menu.MenuCheckboxItem
                id="context-toggle"
                label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
                checked={isEnabled}
                action={() => settings.store.isEnabled = !settings.store.isEnabled}
            />
            <Menu.MenuCheckboxItem
                id="keybind-toggle"
                label={keybindEnabled ? "Disable Keybind" : "Enable Keybind"}
                checked={keybindEnabled}
                action={() => settings.store.keybindEnabled = !settings.store.keybindEnabled}
            />
            <Menu.MenuSeparator />
            <Menu.MenuItem
                id="settings"
                label="Crasher Settings"
                icon={() => (<CogWheel width="24" height="24" fill="none" viewBox="0 0 24 24" className={CMIconClasses.icon} />)}
                action={() => openPluginModal(Velocity.Plugins.plugins.StreamCrasher)}
            />
        </Menu.Menu>
    );
}

export const StreamCrasherPatch = (settings): NavContextMenuPatchCallback => (children, props) => {
    const { isEnabled } = settings.use(["isEnabled"]);

    children.splice(3, 0,
        <Menu.MenuCheckboxItem
            id="stream-crasher-enable"
            label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
            checked={isEnabled}
            action={() => settings.store.isEnabled = !settings.store.isEnabled}
        />
    );
};
