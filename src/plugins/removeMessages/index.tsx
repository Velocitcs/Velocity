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

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { definePluginSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Card, Forms, Menu, React, TagGroup, TextInput, Toasts, UserStore, useState } from "@webpack/common";

type Rule = Record<"word", string>;

const cl = classNameFactory("vc-rm-");

interface RulesProps {
    rulesArray: Rule[];
}

const makeEmptyRule: () => Rule = () => ({
    word: ""
});

const makeEmptyRuleArray = () => [makeEmptyRule()];

const settings = definePluginSettings({
    wordRules: {
        type: OptionType.COMPONENT,
        component: () => {
            const { wordRules } = settings.use(["wordRules"]);
            return <RulesSettings rulesArray={wordRules} />;
        },
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
    },
    removeMode: {
        type: OptionType.SELECT,
        description: "How to remove filtered words",
        default: "entire",
        options: [
            { label: "Remove entire message", value: "entire" },
            { label: "Remove only the phrase", value: "phrase" }
        ]
    }
});

function RulesSettings({ rulesArray }: RulesProps) {
    const [inputValue, setInputValue] = useState("");
    const hasWords = rulesArray.some(r => r.word);

    const handleTag = (action: "add" | "remove", value?: string | Set<string>) => {
        if (action === "add") {
            if (!inputValue.trim()) return;
            const exists = rulesArray.some(r => r.word.toLowerCase() === inputValue.toLowerCase());
            if (!exists) {
                rulesArray.push({ word: inputValue });
                setInputValue("");
            }
        } else if (action === "remove" && value instanceof Set) {
            value.forEach(key => {
                const index = rulesArray.findIndex(r => r.word === key);
                if (index !== -1) {
                    rulesArray.splice(index, 1);
                }
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTag("add");
        }
    };

    return (
        <>
            <Flex flexDirection="row">
                <TextInput
                    placeholder="Add word or phrase..."
                    value={inputValue}
                    maxLength={50}
                    helperText='Press Enter to add this word'
                    showCharacterCount={true}
                    onChange={setInputValue}
                    onKeyDown={handleKeyDown}
                />
            </Flex>

            {hasWords && (
                <>
                    <Forms.FormSection tag="h4" title="Words to Remove">
                        <Card className={cl("card")}>
                            <div className={cl("tags-container")}>
                                <TagGroup
                                    label="Word Filters"
                                    layout="inline"
                                    items={rulesArray.filter(r => r.word).map(r => ({ id: r.word, label: r.word }))}
                                    onRemove={keys => handleTag("remove", keys)}
                                />
                            </div>
                        </Card>
                    </Forms.FormSection>
                </>
            )}
        </>
    );
}

const toggleWord = (word: string) => {
    const rules = settings.store.wordRules;
    const index = rules.findIndex(r => r.word.toLowerCase() === word.toLowerCase());

    if (index !== -1) {
        rules.splice(index, 1);
        Toasts.show({ message: `Removed "${word}" from message filter`, id: Toasts.genId(), type: Toasts.Type.SUCCESS });
    } else {
        rules.push({ word });
        Toasts.show({ message: `Added "${word}" to message filter`, id: Toasts.genId(), type: Toasts.Type.SUCCESS });
    }
};

const wordExists = (word: string): boolean => {
    return settings.store.wordRules.some(r => r.word.toLowerCase() === word.toLowerCase());
};

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, _props) => {
    const selection = document.getSelection()?.toString();
    if (!selection) return;

    const group = findGroupChildrenByChildId("search-google", children);
    if (!group) return;

    const idx = group.findIndex(c => c?.props?.id === "search-google");
    if (idx === -1) return;

    const exists = wordExists(selection);
    const displayText = selection.length > 15 ? selection.slice(0, 15) + "..." : selection;

    group.splice(idx + 1, 0,
        <Menu.MenuItem
            key="vc-remove-messages"
            id="add-message-filter"
            label={exists ? "Remove MessageFilter" : "Add MessageFilter"}
            hint={displayText}
            action={() => toggleWord(selection)}
        />
    );
};

export default definePlugin({
    name: "RemoveMessages",
    description: "Removes messages containing specified words",
    tags: ["HideMessages"],
    authors: [Devs.Velocity],

    settings,

    contextMenus: {
        "message": messageContextMenuPatch
    },

    renderMessageAccessory(props) {
        const currentUser = UserStore.getCurrentUser();

        if (settings.store.ignoreSelf && props.message.author.id === currentUser?.id) return null;
        if (settings.store.ignoreBots && props.message.author.bot) return null;

        const wordsToRemove = settings.store.wordRules.filter(r => r.word);
        const messageContent = props.message.content || "";

        if (settings.store.removeMode === "entire") {
            if (wordsToRemove.some(rule => messageContent.toUpperCase().includes(rule.word.toUpperCase()))) {
                props.message.content = "";
            }
        } else if (settings.store.removeMode === "phrase") {
            let filteredContent = messageContent;
            wordsToRemove.forEach(rule => {
                const regex = new RegExp(rule.word, "gi");
                filteredContent = filteredContent.replace(regex, "").trim();
            });
            if (filteredContent !== messageContent) {
                props.message.content = filteredContent;
            }
        }

        return null;
    }
});
