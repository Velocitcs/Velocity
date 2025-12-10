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

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Text } from "@components/BaseText";
import { Button } from "@components/Button";
import { CodeBlock } from "@components/CodeBlock";
import { Divider } from "@components/Divider";
import ErrorBoundary from "@components/ErrorBoundary";
import { CodeIcon, CopyIcon, LogIcon, NotesIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { copyWithToast } from "@utils/discord";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Embed, Message } from "@velocity-types";
import { CMIconClasses, Forms, Menu, React } from "@webpack/common";

import { cleanEmbed, copyEmbedContent } from "./utils";

function openEmbedRawModal(msg: Message) {
    const cleanEmbeds = msg.embeds.map(cleanEmbed);
    const embedJson = JSON.stringify({ content: null, embeds: cleanEmbeds, attachments: [] }, null, 4);

    openModal(props => (
        <ErrorBoundary>
            <ModalRoot {...props} size={ModalSize.MEDIUM}>
                <ModalHeader>
                    <Text tag="h3" variant="heading-md/bold" style={{ flexGrow: 1 }}>View Raw Embeds</Text>
                    <ModalCloseButton onClick={props.onClose} />
                </ModalHeader>
                <Divider />
                <ModalContent>
                    {cleanEmbeds.map((embed, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <Divider
                                    className={`${Margins.top16} ${Margins.bottom20}`}
                                />
                            )}
                            <Forms.FormTitle tag="h5">
                                Embed {i + 1} Data
                            </Forms.FormTitle>
                            <CodeBlock
                                content={JSON.stringify(embed, null, 4)}
                                lang="json"
                                className={Margins.bottom20}
                            />
                        </React.Fragment>
                    ))}

                    {cleanEmbeds.length > 1 && (
                        <>
                            <Divider
                                className={`${Margins.top16} ${Margins.bottom20}`}
                            />
                            <Forms.FormTitle tag="h5">
                                All Embeds Combined
                            </Forms.FormTitle>
                            <CodeBlock
                                content={embedJson}
                                lang="json"
                                className={Margins.bottom20}
                            />
                        </>
                    )}
                </ModalContent>
                <ModalFooter>
                    <Button
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.BRAND}
                        onClick={() => copyWithToast(embedJson, "All embed data copied to clipboard!")}
                    >
                        Copy All Embeds JSON
                    </Button>
                </ModalFooter>
            </ModalRoot>
        </ErrorBoundary>
    ));
}

const messageContextCallback: NavContextMenuPatchCallback = (children, props) => {
    // discord.js sends the "type" on the embed, its the only thing
    // that is on an actual discord embed. thus this will check if the menu should appear.
    if (!props.message.embeds.length) return;
    if (!props.message.embeds.some((props: any) => props.type === "rich")) return;

    const group = findGroupChildrenByChildId("copy-link", children);

    if (group) {
        group.push(
            <Menu.MenuItem
                id="vc-embed-data"
                label="Embed Data"
            >
                <Menu.MenuItem
                    id="vc-copy-embed-data"
                    label="Copy Embed Data"
                    action={() => copyEmbedContent(props.message, "embed")}
                    icon={() => <CodeIcon width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
                />
                <Menu.MenuItem
                    id="vc-copy-full-json"
                    label="Copy Full JSON"
                    action={() => copyEmbedContent(props.message, "full")}
                    icon={() => <LogIcon width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
                />
                <Menu.MenuSeparator />
                {props.message.embeds.filter((e: Embed) => e.rawDescription).length > 1 ? (
                    <Menu.MenuItem
                        id="vc-copy-embed-description"
                        label="Copy Embed Description"
                    >
                        {props.message.embeds.map((embed: Embed, i: number) =>
                            embed.rawDescription ? (
                                <Menu.MenuItem
                                    key={i}
                                    id={`vc-copy-embed-desc-${i}`}
                                    label={`Copy Embed ${i + 1} Description`}
                                    action={() => copyEmbedContent(props.message, "description", i)}
                                    icon={() => <NotesIcon width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
                                />
                            ) : null
                        )}
                    </Menu.MenuItem>
                ) : props.message.embeds[0]?.rawDescription ? (
                    <Menu.MenuItem
                        id="vc-copy-embed-description"
                        label="Copy Embed Description"
                        action={() => copyEmbedContent(props.message, "description", 0)}
                        icon={() => <NotesIcon width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
                    />
                ) : null}
                <Menu.MenuItem
                    id="vc-copy-embed-builder"
                    label="Copy EmbedBuilder"
                    action={() => copyEmbedContent(props.message, "builder")}
                    icon={() => <CopyIcon width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
                />
                <Menu.MenuSeparator />
                <Menu.MenuItem
                    id="vc-view-raw-embed"
                    label="View Raw Embed"
                    action={() => openEmbedRawModal(props.message)}
                    icon={() => <LogIcon width="24" height="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
                />
            </Menu.MenuItem>
        );
    }
};

export default definePlugin({
    name: "CopyEmbed",
    description: "Copy embeds structure, descriptions, and generate EmbedBuilder code.",
    authors: [Devs.Velocity],

    contextMenus: {
        "message": messageContextCallback
    }
});
