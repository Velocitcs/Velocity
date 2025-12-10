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
import type { Button as ButtonTypes } from "@velocity-types";
import type { ComponentPropsWithRef, ComponentType } from "react";

import { OpenExternalIcon } from "./Icons";

const btnCls = classNameFactory("vc-btn-");

export type ButtonVariant = | "primary" | "secondary" | "dangerPrimary" | "dangerSecondary" | "overlayPrimary" | "positive" | "transparent" | "link" | "white" | "custom";
export type ButtonType = | "button" | "text";
export type ButtonSize = "min" | "xs" | "small" | "medium";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: ButtonType;
    icon?: ComponentType<any>;
    loading?: boolean;
    fullWidth?: boolean;
};

const Sizes = {
    SMALL: "small",
    MEDIUM: "medium",
    LARGE: "large",
    XLARGE: "xlarge",
    TINY: "min",
    MAX: "max",
    ICON: "icon",
    MIN: "min",
    NONE: "none",
};

const Looks = {
    FILLED: "",
    LINK: "LINK",
    INVERTED: "INVERTED",
    OUTLINED: "OUTLINED",
    BLANK: "BLANK",
};

const Colors = {
    BRAND: "BRAND",
    PRIMARY: "PRIMARY",
    RED: "RED",
    TRANSPARENT: "TRANSPARENT",
    CUSTOM: "CUSTOM",
    GREEN: "GREEN",
    LINK: "LINK",
    WHITE: "WHITE",
};

const ButtonColorMapping: Record<keyof typeof Colors, ButtonProps["variant"]> = {
    BRAND: "primary",
    PRIMARY: "secondary",
    RED: "dangerPrimary",
    TRANSPARENT: "secondary",
    CUSTOM: "custom",
    GREEN: "positive",
    LINK: "link",
    WHITE: "overlayPrimary",
};

function ButtonBase({
    variant = "primary",
    size = "medium",
    children,
    className,
    icon: Icon,
    loading,
    fullWidth,
    ...restProps
}: ButtonProps) {
    return (
        <button
            data-mana-component="button"
            className={classes(btnCls("base", variant, size, fullWidth && "fullWidth"), className)}
            disabled={loading || restProps.disabled}
            {...restProps}
        >
            {Icon && (
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
                    <Icon width={20} height={20} />
                </span>
            )}

            {children}
            {variant === "link" && !Icon && (
                <span className={btnCls("link-icon")}>
                    <OpenExternalIcon width="24" height="24" fill="none" viewBox="0 0 24 24" className="vc-icon" />
                </span>
            )}
        </button>
    );
}

export const Button: ButtonTypes = function Button({
    look,
    color = "BRAND" as keyof typeof Colors,
    size = "medium",
    loading = false,
    fullWidth,
    icon,
    ...restProps
}) {
    return (
        <ButtonBase
            variant={ButtonColorMapping[color]}
            size={size as ButtonSize}
            icon={icon}
            fullWidth={fullWidth}
            loading={loading}
            {...(restProps as ButtonProps)}
        />
    );
} as ButtonTypes & {
    Looks: Record<keyof typeof Looks, string>;
    Colors: Record<keyof typeof Colors, string>;
    Sizes: Record<keyof typeof Sizes, string>;
    Types: Record<ButtonType, string>;
};

Button.Colors = Colors;
Button.Sizes = Sizes;
Button.Looks = Looks;
Button.Types = { BUTTON: "button", TEXT: "text" };
