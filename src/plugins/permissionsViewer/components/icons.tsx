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

import { findComponentByCodeLazy } from "@webpack";

export const IdIcon = findComponentByCodeLazy("Zm4-9.66V17h3.44c1.46 0 2.6-");

export function PermissionDeniedIcon() {
    return (
        <svg
            height="24"
            width="24"
            viewBox="0 0 24 24"
        >
            <title>Denied</title>
            <path fill="var(--status-danger)" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z" />
        </svg>
    );
}

export function PermissionAllowedIcon() {
    return (
        <svg
            height="24"
            width="24"
            viewBox="0 0 24 24"
        >
            <title>Allowed</title>
            <path fill="var(--status-positive)" d="M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17ZZ" />
        </svg>
    );
}

export function PermissionDefaultIcon() {
    return (
        <svg
            height="24"
            width="24"
            viewBox="0 0 16 16"
        >
            <g>
                <title>Not overwritten</title>
                <polygon fill="var(--text-default)" points="12 2.32 10.513 2 4 13.68 5.487 14" />
            </g>
        </svg>
    );
}

export function ViewServerAsRoleIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M20.7 12.7a1 1 0 0 0 0-1.4l-5-5a1 1 0 1 0-1.4 1.4l3.29 3.3H4a1 1 0 1 0 0 2h13.59l-3.3 3.3a1 1 0 0 0 1.42 1.4l5-5Z"
            />
        </svg>
    );
}
