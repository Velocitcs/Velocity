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
import { Text } from "@components/BaseText";
import { Button } from "@components/Button";
import { Flex } from "@components/Flex";
import { DeleteIcon, PlusIcon } from "@components/Icons";
import { copyToClipboard } from "@utils/clipboard";
import { Devs } from "@utils/constants";
import { getIntlMessage, openUserProfile } from "@utils/discord";
import { ModalContent, ModalFooter, ModalHeader, ModalRoot } from "@utils/modal";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Avatar, Clickable, TextInput, Tooltip, useState } from "@webpack/common";

import { BanHammer } from "./icons";


const BanActions = findByPropsLazy("fetchGuildBans", "unbanUser");
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
                alignItems="center"
                style={{ width: "100%" }}
            >
                <Button
                    onClick={() => {
                        const newList = [...reasons, ""];
                        settings.store.reasons = newList;
                    }}
                    size={Button.Sizes.LARGE}
                    color={Button.Colors.TRANSPARENT}
                    look={Button.Looks.FILLED}
                >
                    <PlusIcon viewBox="0 0 24 24" height="24" width="24" /> Add another reason
                </Button>
            </Flex>
        </>
    );
}

function BanModalComponent({ transitionState, guild, user, ban, onClose }: any) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleUnban = async () => {
        setError(null);
        setLoading(true);
        try {
            await BanActions.unbanUser(guild.id, user.id);
            onClose();
        } catch (e: any) {
            setError(e.message);
            setLoading(false);
        }
    };

    const copyUsername = () => {
        copyToClipboard(user.username);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ModalRoot className={cl("ban-modal")} transitionState={transitionState}>
            <ModalHeader separator={false} className={cl("modal-user-section")}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Clickable onClick={() => openUserProfile(user.id)} style={{ cursor: "pointer" }}>
                        <Avatar src={user.getAvatarURL(guild.id, 96)} size="SIZE_80" />
                    </Clickable>
                    <div className={cl("ban-user-details")}>
                        {copied ? (
                            <Tooltip text="Copied!" color="green" forceOpen={true}>
                                {props => (
                                    <Text
                                        {...props}
                                        variant="heading-xl/semibold"
                                        onClick={copyUsername}
                                        style={{ cursor: "pointer" }}
                                    >
                                        @{user.username}
                                    </Text>
                                )}
                            </Tooltip>
                        ) : (
                            <Text
                                variant="heading-xl/semibold"
                                onClick={copyUsername}
                                style={{ cursor: "pointer" }}
                            >
                                @{user.username}
                            </Text>
                        )}
                        {user.globalName && <Text variant="text-md/normal" color="header-secondary">{user.globalName}</Text>}
                        {!user.hasUniqueUsername() && <Text variant="text-md/normal" color="header-secondary">#{user.discriminator}</Text>}
                    </div>
                </div>
            </ModalHeader>

            <ModalContent className={cl("ban-modal-content")}>
                <Text variant="text-md/bold">Ban Reason</Text>
                <Text variant="text-sm/normal">{ban?.reason || "No reason provided"}</Text>

                <Text variant="text-md/bold" style={{ marginTop: "16px" }}>User Info</Text>
                <Text variant="text-xs/normal" color="text-muted">User ID: {user.id}</Text>
                {user.globalName && <Text variant="text-xs/normal" color="text-muted">Display Name: {user.globalName}</Text>}
                <Text variant="text-xs/normal" color="text-muted">Account Created: {new Date(user.createdAt).toLocaleDateString()}</Text>

                {error && <Text variant="text-sm/normal" color="text-danger">{error}</Text>}
            </ModalContent>

            <ModalFooter className={cl("modal-footer")}>
                <Button
                    size={Button.Sizes.MEDIUM}
                    color={Button.Colors.RED}
                    icon={BanHammer}
                    onClick={handleUnban}
                    disabled={loading}
                >
                    {loading ? "Unbanning..." : "Unban User"}
                </Button>
                <Button size={Button.Sizes.MEDIUM} color={Button.Colors.PRIMARY} onClick={onClose}>
                    Close
                </Button>
            </ModalFooter>
        </ModalRoot>
    );
}

const settings = definePluginSettings({
    reasons: {
        description: "Your custom reasons",
        type: OptionType.COMPONENT,
        default: [] as string[],
        component: ReasonsComponent,
    },
    betterModal: {
        description: "Redesigns the user ban modal from the guild ban list",
        type: OptionType.BOOLEAN,
        default: true,
        restartNeeded: true
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
            lazy: true,
            replacement: [
                {
                    match: /\[({name:.+?,value:.+?},){2}{name:.+?,value:"other"}\]/,
                    replace: "$self.getReasons($1)"
                },
                {
                    match: /(?:\w+\.)?useState\(""\)(?=.{0,200}isArchivedThread)/,
                    replace: "useState($self.getDefaultState())"
                }
            ]
        },
        {
            find: "bansSearchContainer,children:",
            predicate: () => settings.store.betterModal,
            replacement: {
                match: /\(0,o\.ZDy\)\(async\(\)=>\{let\{default:l\}=await n\.e\("[^"]+"\)\.then\(n\.bind\(n,\d+\)\);return n=>\(0,r\.jsx\)\(l,/,
                replace: "(0,o.ZDy)(async()=>{return n=>$self.renderBanModal("
            }
        }
    ],

    renderBanModal(props: any) {
        return <BanModalComponent {...props} />;
    },

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
