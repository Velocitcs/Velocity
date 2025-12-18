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

import { JSX } from "react";

export interface EmbedComponentProps {
    embed: {
        type?: string;
        provider?: { name: string; url?: string; };
        author?: { name: string; iconProxyURL?: string; url?: string; };
        rawTitle?: string;
        rawDescription?: string;
        url?: string;
        thumbnail?: { width: number; height: number; url: string; srcIsAnimated?: boolean; placeholder?: string; placeholderVersion?: string; };
        image?: { width: number; height: number; url: string; srcIsAnimated?: boolean; placeholder?: string; placeholderVersion?: string; };
        images?: Array<{ width: number; height: number; url: string; srcIsAnimated?: boolean; placeholder?: string; placeholderVersion?: string; }>;
        video?: { width: number; height: number; url: string; proxyURL?: string; placeholder?: string; placeholderVersion?: string; };
        fields?: Array<{ rawName: string; rawValue: string; inline?: boolean; }>;
        footer?: { text: string; iconProxyURL?: string; };
        timestamp?: boolean | string | number;
        color?: string;
        components?: any[];
    };
    message?: { id: string; channel_id: string; };
    className?: string;
    hideMedia?: boolean;
    allowFullScreen?: boolean;
    maxThumbnailWidth?: number;
    maxThumbnailHeight?: number;
    embedIndex?: number;
    obscureReason?: string;
    shouldAgeVerify?: boolean;
    autoPlayGif?: boolean;
    renderImageComponent: (props: any) => JSX.Element;
    renderVideoComponent: (props: any) => JSX.Element;
    renderLinkComponent: (props: any) => JSX.Element;
    renderTitle: (embed: any, title: string) => JSX.Element;
    renderDescription: (embed: any, description: string, inline: boolean) => JSX.Element;
    onSuppressEmbed?: () => void;
}
