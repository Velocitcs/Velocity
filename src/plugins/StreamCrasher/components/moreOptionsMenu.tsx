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
import { Menu } from "@webpack/common";

export const StreamCrasherPatch = (settings): NavContextMenuPatchCallback => (children, props) => {
    const { isEnabled } = settings.use(["isEnabled"]);

    children.splice(3, 0,
        <Menu.MenuCheckboxItem
            id="manage-streams-crasher-settings-enable"
            label={isEnabled ? "Disable Crasher" : "Enable Crasher"}
            checked={isEnabled}
            action={() => settings.store.isEnabled = !settings.store.isEnabled}
        />
    );
};
