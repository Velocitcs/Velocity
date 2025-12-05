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

import "./Button.css";

import { classNameFactory } from "@api/Styles";
import { classes } from "@utils/misc";
import type { Button as DiscordButton } from "@velocity-types";
import type { ComponentPropsWithRef } from "react";

import { OpenExternalIcon } from "./Icons";

const btnCls = classNameFactory("vc-btn-");
const textBtnCls = classNameFactory("vc-text-btn-");

export type ButtonSize = "min" | "xs" | "small" | "medium";

export type TextButtonVariant = "primary" | "secondary" | "danger" | "link";

export type TextButtonProps = ComponentPropsWithRef<"button"> & {
    variant?: TextButtonVariant;
};

export function TextButton({
    variant = "primary",
    className,
    ...restProps
}: TextButtonProps) {
    return (
        <button
            className={classes(textBtnCls("base", variant), className)}
            {...restProps}
        />
    );
}

const ButtonColorMapping: Record<string, string> = {
    BRAND: "primary",
    PRIMARY: "primary",
    RED: "dangerPrimary",
    TRANSPARENT: "secondary",
    CUSTOM: "none",
    GREEN: "positive",
    LINK: "link",
    WHITE: "overlayPrimary",
};

const TextButtonPropsColorMapping: Record<string, TextButtonProps["variant"]> = {
    BRAND: "primary",
    PRIMARY: "primary",
    RED: "danger",
    TRANSPARENT: "secondary",
    CUSTOM: "secondary",
    GREEN: "primary",
    LINK: "link",
    WHITE: "secondary",
};

export const Button: DiscordButton = function Button({
    look,
    color = "BRAND",
    size = "medium",
    loading = false,
    icon,
    ...restProps
}) {
    return look === "LINK" ? (
        <TextButton
            variant={TextButtonPropsColorMapping[color]}
            {...(restProps as TextButtonProps)}
        />
    ) : (
        <button
            data-mana-component="button"
            className={classes(btnCls("base", ButtonColorMapping[color], size), restProps.className)}
            {...restProps as any}
            disabled={loading || restProps.disabled}
        >
            {icon && (
                <span
                    className={btnCls("icon")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "20px",
                        height: "20px",
                        flexShrink: 0,
                        marginRight: "6px",
                        marginLeft: "-4px",
                    }}
                >
                    {icon}
                </span>
            )}
            {restProps.children}
            {color === "LINK" && !icon && (
                <span className={btnCls("link-icon")}>
                    <OpenExternalIcon width="24" height="24" fill="none" viewBox="0 0 24 24" className="vc-icon" />
                </span>
            )}
        </button>
    );
};

Button.Looks = {
    FILLED: "",
    LINK: "LINK",
} as const;

Button.Colors = {
    BRAND: "BRAND",
    PRIMARY: "PRIMARY",
    RED: "RED",
    TRANSPARENT: "TRANSPARENT",
    CUSTOM: "CUSTOM",
    GREEN: "GREEN",
    LINK: "LINK",
    WHITE: "WHITE",
} as const;

Button.Sizes = {
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "medium",
    XLARGE: "medium",
    NONE: "min",
    MIN: "min",
} as const;
