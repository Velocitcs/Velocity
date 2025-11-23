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

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { DeleteIcon, PlusIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import { getIntlMessage } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";
import { Button, Flex, TextInput } from "@webpack/common";

const cl = classNameFactory("vc-bbr-");

function ReasonsComponent() {
    const { reasons } = settings.store;

    return (
        <>
            {reasons.map((r, i) => (
                <Flex flexDirection="column" style={{ gap: "0.5em" }} key={i}>
                    <Flex flexDirection="row" style={{ flexGrow: 1, gap: "0.5em" }}>
                        <div style={{ flexGrow: 1 }}>
                            <TextInput
                                placeholder="Reason"
                                value={r}
                                onChange={v => {
                                    const list = [...reasons];
                                    list[i] = v;
                                    settings.store.reasons = list;
                                }}
                            />
                        </div>

                        <Button
                            className={cl("remove-button")}
                            size={Button.Sizes.MIN}
                            look={Button.Looks.FILLED}
                            color={Button.Colors.TRANSPARENT}
                            onClick={() => {
                                const list = [...reasons];
                                list.splice(i, 1);
                                settings.store.reasons = list;
                            }}
                        >
                            <DeleteIcon width="24" height="24" fill="none" viewBox="0 0 24 24" />
                        </Button>
                    </Flex>
                </Flex>
            ))}

            <Flex
                className={cl("reason-wrapper")}
                flexDirection="row"
                align="center"
                style={{ width: "100%" }}
            >
                <Button
                    onClick={() => {
                        const newList = [...reasons, ""];
                        settings.store.reasons = newList;
                    }}
                    className={cl("add-button")}
                    size={Button.Sizes.LARGE}
                    color={Button.Colors.TRANSPARENT}
                >
                    <PlusIcon viewBox="0 0 24 24" height="24" width="24" /> Add another reason
                </Button>
            </Flex>
        </>
    );
}

const settings = definePluginSettings({
    reasons: {
        description: "Your custom reasons",
        type: OptionType.COMPONENT,
        default: [] as string[],
        component: ReasonsComponent,
    },
    isOtherDefault: {
        type: OptionType.BOOLEAN,
        description: "Selects the other option by default. (Shows a text input)"
    }
});

export default definePlugin({
    name: "BetterBanReasons",
    description: "Create custom reasons to use in the Discord ban modal, and/or show a text input by default instead of the options.",
    authors: [Devs.Velocity],
    settings,

    patches: [
        {
            find: 'username:"@"',
            replacement: [{
                match: /\[({name:.+?,value:.+?},){2}{name:.+?,value:"other"}\]/,
                replace: "$self.getReasons($1)"
            },
            {
                match: /(?:\w+\.)?useState\(""\)(?=.{0,200}isArchivedThread)/,
                replace: "useState($self.getDefaultState())"
            }]
        }
    ],

    getReasons() {
        const storedReasons = settings.store.reasons.filter((r: string) => r.trim());
        const reasons: string[] = storedReasons.length
            ? storedReasons
            : [
                getIntlMessage("BAN_REASON_OPTION_SPAM_ACCOUNT"),
                getIntlMessage("BAN_REASON_OPTION_HACKED_ACCOUNT"),
                getIntlMessage("BAN_REASON_OPTION_BREAKING_RULES"),
            ];
        return reasons.map(s => ({ name: s, value: s })).concat({ name: getIntlMessage("BAN_REASON_OPTION_OTHER"), value: "other" });
    },

    getDefaultState: () => settings.store.isOtherDefault ? "other" : "",
});
