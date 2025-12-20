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

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Text } from "@components/BaseText";
import { Button } from "@components/Button";
import { CodeBlock } from "@components/CodeBlock";
import { Divider } from "@components/Divider";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { CodeIcon, LogIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import { copyWithToast, getCurrentGuild, getIntlMessage } from "@utils/discord";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Message, User } from "@velocity-types";
import { ChannelStore, CMIconClasses, Forms, GuildRoleStore, Menu, PopoverClasses, React } from "@webpack/common";

function sortObject<T extends object>(obj: T): T {
    return Object.fromEntries(Object.entries(obj).sort(([k1], [k2]) => k1.localeCompare(k2))) as T;
}

function cleanMessage(msg: Message) {
    const clone = sortObject(JSON.parse(JSON.stringify(msg)));
    for (const key of ["email", "phone", "mfaEnabled", "personalConnectionId"])
        delete clone.author[key];

    const cloneAny = clone as any;
    delete cloneAny.editHistory;
    delete cloneAny.deleted;
    delete cloneAny.firstEditTimestamp;
    cloneAny.attachments?.forEach((a: any) => delete a.deleted);

    return clone;
}

function cleanUser(user: User) {
    const clone = sortObject(JSON.parse(JSON.stringify(user)));
    for (const key of ["email", "phone", "mfaEnabled", "personalConnectionId"])
        delete clone[key];

    return clone;
}

function openViewRawModal(json: string, type: string, msgContent?: string) {
    const key = openModal(props => (
        <ErrorBoundary>
            <ModalRoot {...props} size={ModalSize.LARGE}>
                <ModalHeader>
                    <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>View Raw</Text>
                    <ModalCloseButton onClick={() => closeModal(key)} />
                </ModalHeader>
                <ModalContent>
                    <div style={{ padding: "16px 0" }}>
                        {!!msgContent && (
                            <>
                                <Forms.FormTitle tag="h5">Content</Forms.FormTitle>
                                <CodeBlock className="vc-codeblock" content={msgContent} lang="" />
                                <Divider className={Margins.bottom20} />
                            </>
                        )}

                        <Forms.FormTitle tag="h5">{type} Data</Forms.FormTitle>
                        <CodeBlock className="vc-codeblock" content={json} lang="json" />
                    </div>
                </ModalContent >
                <ModalFooter>
                    <Flex>
                        <Button color={Button.Colors.PRIMARY} icon={() => <CodeIcon width="24" height="24" />} onClick={() => copyWithToast(json, `${type} data copied to clipboard!`)}
                        >
                            Copy {type} JSON
                        </Button>
                        {!!msgContent && (
                            <Button color={Button.Colors.BRAND} icon={() => <CodeIcon width="24" height="24" />} onClick={() => copyWithToast(msgContent, "Content copied to clipboard!")}>
                                Copy Raw Content
                            </Button>
                        )}
                    </Flex>
                </ModalFooter>
            </ModalRoot >
        </ErrorBoundary >
    ));
}

const messageContextCallback: NavContextMenuPatchCallback = (children, props) => {
    if (!props?.message) return;

    children.push(
        <Menu.MenuItem
            id="vc-view-message-raw"
            label="View Raw"
            action={() => openViewRawModal(JSON.stringify(props.message, null, 4), "Message", props.message.content)}
            icon={() => <LogIcon height="24" width="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
        />
    );
};

function MakeContextCallback(name: "Guild" | "Role" | "User" | "Channel"): NavContextMenuPatchCallback {
    return (children, props) => {
        const value = props[name.toLowerCase()];
        if (!value) return;
        if (props.label === getIntlMessage("CHANNEL_ACTIONS_MENU_LABEL")) return;

        const lastChild = children.at(-1);
        if (lastChild?.key === "developer-actions") {
            const p = lastChild.props;
            if (!Array.isArray(p.children)) p.children = [p.children];
            children = p.children;
        }

        children.splice(-1, 0,
            <Menu.MenuItem
                id={`vc-view-${name.toLowerCase()}-raw`}
                label="View Raw"
                action={() => {
                    if (name === "User") {
                        openViewRawModal(JSON.stringify(cleanUser(value), null, 4), "User");
                    } else {
                        openViewRawModal(JSON.stringify(value, null, 4), name);
                    }
                }}
                icon={() => <LogIcon height="24" width="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
            />
        );
    };
}

const devContextCallback: NavContextMenuPatchCallback = (children, { id }: { id: string; }) => {
    const guild = getCurrentGuild();
    if (!guild) return;

    const role = GuildRoleStore.getRole(guild.id, id);
    if (!role) return;

    children.push(
        <Menu.MenuItem
            id="vc-view-role-raw"
            label="View Raw"
            action={() => openViewRawModal(JSON.stringify(role, null, 4), "Role")}
            icon={() => <LogIcon height="24" width="24" viewBox="0 0 24 24" className={CMIconClasses.icon} />}
        />
    );
};

export default definePlugin({
    name: "ViewRaw",
    description: "Copy and view the raw content/data of any message, user, channel or guild",
    authors: [Devs.KingFish, Devs.Ven, Devs.rad, Devs.ImLvna, Devs.Velocity],

    contextMenus: {
        "guild-context": MakeContextCallback("Guild"),
        "guild-settings-role-context": MakeContextCallback("Role"),
        "channel-context": MakeContextCallback("Channel"),
        "thread-context": MakeContextCallback("Channel"),
        "message": messageContextCallback,
        "gdm-context": MakeContextCallback("Channel"),
        "user-context": MakeContextCallback("User"),
        "dev-context": devContextCallback
    },

    messagePopoverButton: {
        icon: CodeIcon,
        render(msg) {
            return {
                label: "View Raw",
                icon: () => <CodeIcon viewBox="0 0 24 24" height="24" width="24" className={PopoverClasses.icon} />,
                message: msg,
                channel: ChannelStore.getChannel(msg.channel_id),
                onClick: () => openViewRawModal(JSON.stringify(cleanMessage(msg), null, 4), "Message", msg.content),
                onContextMenu: (e: any) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyWithToast(msg.content);
                }
            };
        }
    }
});
