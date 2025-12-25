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

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "ThemesComponentsAPI",
    authors: [Devs.Velocity],
    description: "Api required for theme components",
    required: true,
    patches: [
        {
            find: "onSelectionChange:h,value:g",
            replacement: [
                {
                    match: /onSelectionChange:h/g,
                    replace: "onChange:h"
                },
                {
                    match: /hideTags:s/g,
                    replace: "hideTags:s=!0"
                },
                {
                    match: /selectionMode:U/g,
                    replace: "selectionMode:U=\"single\""
                },
                {
                    match: /B=i\.useMemo\(\(\)=>\("single"===d&&\(F\.current=M\.find\(e=>e\.value===g\)\),null==g\|\|Array\.isArray\(g\)&&0===g\.length\)\?\[\]:/,
                    replace: "B=i.useMemo(()=>(\"single\"===d&&(F.current=M.find(e=>e.value===g)),null==g||Array.isArray(g)&&0===g.length)?[c.find(e=>e.default)]:"
                }
            ]
        },
        {
            find: "closeOnSelect:_,formatOption:m",
            replacement: {
                match: /closeOnSelect:_,/,
                replace: "closeOnSelect,"
            }
        },
        {
            find: "hideTags:t,wrapTags:n,maxOptionsVisible:c=5",
            replacement: [
                {
                    match: /\}=d/,
                    replace: ",select:M,isSelected:k,serialize:U,clear:G}=d"
                }
            ]
        }
    ]
});
