/*
 * Velocity, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Flex } from "@components/Flex";
import { DeleteIcon } from "@components/Icons";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Button, Forms, React, TextInput, UserStore, useState } from "@webpack/common";

type Rule = Record<"word", string>;

interface RemoveTFProps {
    rulesArray: Rule[];
}

const makeEmptyRule: () => Rule = () => ({
    word: ""
});
const makeEmptyRuleArray = () => [makeEmptyRule()];

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

function RemoveTFSettings({ rulesArray }: RemoveTFProps) {
    async function onClickRemove(index: number) {
        if (index === rulesArray.length - 1) return;
        rulesArray.splice(index, 1);
    }

    async function onChange(e: string, index: number) {
        rulesArray[index].word = e;

        if (index === rulesArray.length - 1 && rulesArray[index].word) {
            rulesArray.push(makeEmptyRule());
        }

        if (!rulesArray[index].word && index !== rulesArray.length - 1) {
            rulesArray.splice(index, 1);
        }
    }

    return (
        <>
            <Forms.FormTitle tag="h4">Words to Remove</Forms.FormTitle>
            <Flex flexDirection="column" style={{ gap: "0.5em" }}>
                {
                    rulesArray.map((rule, index) => {
                        const isLast = index === rulesArray.length - 1;
                        return (
                            <React.Fragment key={`${rule.word}-${index}`}>
                                <Flex flexDirection="row" style={{ flexGrow: 1, gap: "0.5em" }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <Input
                                            placeholder="Word or phrase"
                                            initialValue={rule.word}
                                            onChange={e => onChange(e, index)}
                                        />
                                    </div>
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

const settings = definePluginSettings({
    words: {
        type: OptionType.COMPONENT,
        component: () => {
            const { wordRules } = settings.use(["wordRules"]);

            return (
                <RemoveTFSettings rulesArray={wordRules} />
            );
        }
    },
    wordRules: {
        type: OptionType.CUSTOM,
        default: makeEmptyRuleArray(),
    },
    ignoreBots: {
        type: OptionType.BOOLEAN,
        description: "Ignore messages from bots",
        default: true
    },
    ignoreSelf: {
        type: OptionType.BOOLEAN,
        description: "Ignore your own messages",
        default: true
    }
});

export default definePlugin({
    name: "RemoveMessages",
    description: "Removes messages containing specified words",
    authors: [Devs.Velocity],

    settings,

    renderMessageAccessory(props) {
        const currentUser = UserStore.getCurrentUser();

        if (settings.store.ignoreSelf && props.message.author.id === currentUser?.id) return null;
        if (settings.store.ignoreBots && props.message.author.bot) return null;

        const wordsToRemove = settings.store.wordRules
            .filter(r => r.word)
            .map(r => r.word.toUpperCase());

        const messageContent = props.message.content?.toUpperCase() || "";

        if (wordsToRemove.some(word => messageContent.includes(word))) {
            props.message.content = "";
        }

        return null;
    }
});
