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

import { findByCodeLazy, findByPropsLazy } from "@webpack";
import type { ComponentType, ReactNode } from "react";

import { LazyComponent } from "./react";

export const ManaModalStyles = findByPropsLazy("bodySpacerBottom", "bodySpacerBottomBorder", "actionBar");

const enum ModalTransitionState { ENTERING, ENTERED, EXITING, EXITED, HIDDEN }

export interface ManaModalProps {
    transitionState?: ModalTransitionState | number;
    onClose(): void;

    size?: "sm" | "md" | "lg";
    paddingSize?: "sm" | "md" | "lg";
    fullScreenOnMobile?: boolean;
    role?: "dialog" | "alertdialog";
    "aria-label"?: string;
    dismissable?: boolean;
    children?: ReactNode;
}

export interface ManaModalHeaderProps {
    title: string;
    subtitle?: string;
    trailing?: ReactNode;
    leading?: ReactNode;
    gradientColor?: string;
}

export interface ManaModalFooterProps extends React.HTMLAttributes<HTMLElement> {
    leading?: React.ReactNode;
    actions?: Array<{
        text: string;
        icon?: React.ReactNode | (() => React.ReactNode);
        variant?: "primary" | "secondary" | "critical-primary" | "expressive" | (string & {});
        onClick?: (e?: any) => void;
        disabled?: boolean;
        autoFocus?: boolean;
        /** width control */
        fullWidth?: boolean;
        /** aria stuff */
        ariaLabel?: string;
        /** id/class for custom styling */
        id?: string;
        className?: string;
        /** button type */
        type?: "button" | "submit" | "reset" | (string);
        /** custom style */
        style?: React.CSSProperties;
        /** any extra data attibute */
        [key: string]: any;
    }>;
    /** stretch buttons */
    actionsFullWidth?: boolean;
    /** add your own id/class/style to footer */
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    /** any other attrs u throw */
    [key: string]: any;
}

// New Mana Modal Components
export const ManaModalRoot: ComponentType<ManaModalProps> = findByCodeLazy('"data-mana-component":"modal"', "paddingSize");
export const ManaModalHeader: ComponentType<ManaModalHeaderProps> = findByCodeLazy("headerLayout", "headerMain", "headerTitle");
export const ManaModalContent: ComponentType<{ className?: string; children?: ReactNode; }> = findByCodeLazy("controls:t,children:n,listProps:i");
export const ManaModalFooter: ComponentType<ManaModalFooterProps> = findByCodeLazy("actionBar", "actionBarTrailing");

export const ManaModalDivider: ComponentType = () => (
    <div className={`${ManaModalStyles.bodySpacerBottom} ${ManaModalStyles.bodySpacerBottomBorder}`} />
);

export const ManaModal = {
    Root: LazyComponent(() => ManaModalRoot),
    Header: LazyComponent(() => ManaModalHeader),
    Content: LazyComponent(() => ManaModalContent),
    Footer: LazyComponent(() => ManaModalFooter),
    Divider: LazyComponent(() => ManaModalDivider)

};
