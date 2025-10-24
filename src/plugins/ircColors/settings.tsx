/*
 * Velocity, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@components/Flex";
import { DeleteIcon } from "@components/Icons";
import { Button, ColorPicker, Forms, React, TextInput, useState } from "@webpack/common";

type UserColorRule = {
    userId: string;
    color: string;
};

interface CustomUserColorsSettingsProps {
    userColorRules: UserColorRule[];
}

function Input({ initialValue, onChange, placeholder }: {
    placeholder: string;
    initialValue: string;
    onChange(value: string): void;
}) {
    const [value, setValue] = useState(initialValue);

    return (
        <TextInput
            placeholder={placeholder}
            value={value}
            onChange={setValue}
            spellCheck={false}
            onBlur={() => value !== initialValue && onChange(value)}
        />
    );
}

function generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 100;
    const lightness = 70;

    const h = hue / 360;
    const s = saturation / 100;
    const l = lightness / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 1 / 6) { r = c; g = x; b = 0; }
    else if (h < 2 / 6) { r = x; g = c; b = 0; }
    else if (h < 3 / 6) { r = 0; g = c; b = x; }
    else if (h < 4 / 6) { r = 0; g = x; b = c; }
    else if (h < 5 / 6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const red = Math.round((r + m) * 255);
    const green = Math.round((g + m) * 255);
    const blue = Math.round((b + m) * 255);

    return ((red << 16) | (green << 8) | blue).toString(16).padStart(6, "0");
}

export function CustomUserColorsSettings({ userColorRules }: CustomUserColorsSettingsProps) {
    async function onClickRemove(index: number) {
        if (index === userColorRules.length - 1) return;
        userColorRules.splice(index, 1);
    }

    async function onChangeUserId(e: string, index: number) {
        const wasEmpty = !userColorRules[index].userId;
        userColorRules[index].userId = e;

        if (wasEmpty && e) {
            userColorRules[index].color = generateRandomColor();
        }

        if (index === userColorRules.length - 1 && userColorRules[index].userId) {
            userColorRules.push({ userId: "", color: "" });
        }

        if (!userColorRules[index].userId && index !== userColorRules.length - 1) {
            userColorRules.splice(index, 1);
        }
    }

    function onChangeColor(color: number, index: number) {
        const hexColor = color.toString(16).padStart(6, "0");
        userColorRules[index].color = hexColor;
    }

    return (
        <>
            <Forms.FormTitle tag="h4">Custom User Colors</Forms.FormTitle>
            <Flex flexDirection="column" style={{ gap: "0.5em" }}>
                {
                    userColorRules.map((rule, index) => {
                        const isLast = index === userColorRules.length - 1;
                        return (
                            <React.Fragment key={`${rule.userId}-${index}`}>
                                <Flex flexDirection="row" style={{ flexGrow: 1, gap: "0.5em" }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <Input
                                            placeholder="User ID"
                                            initialValue={rule.userId}
                                            onChange={e => onChangeUserId(e, index)}
                                        />
                                    </div>
                                    {rule.userId && (
                                        <ColorPicker
                                            color={parseInt(rule.color, 16)}
                                            onChange={(color: number) => onChangeColor(color, index)}
                                            showEyeDropper={false}
                                        />
                                    )}
                                    {!isLast && (
                                        <Button
                                            size={Button.Sizes.MIN}
                                            onClick={() => onClickRemove(index)}
                                            style={{
                                                background: "none",
                                                color: "var(--status-danger)"
                                            }}
                                        >
                                            {DeleteIcon()()}
                                        </Button>
                                    )}
                                </Flex>
                            </React.Fragment>
                        );
                    })
                }
            </Flex>
        </>
    );
}
