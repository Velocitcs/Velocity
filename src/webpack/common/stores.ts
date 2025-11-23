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

import * as t from "@velocity-types";
import { findByCodeLazy, findByPropsLazy } from "@webpack";

import { waitForStore } from "./internal";

export const Flux: t.Flux = findByPropsLazy("connectStores");

export type GenericStore = t.FluxStore & Record<string, any>;

export const DraftType = findByPropsLazy("ChannelMessage", "SlashCommand");

export let MessageStore: Omit<t.MessageStore, "getMessages"> & GenericStore & {
    getMessages(chanId: string): any;
};

export let PermissionStore: GenericStore;
export let GuildChannelStore: GenericStore;
export let ReadStateStore: GenericStore;
export let PresenceStore: GenericStore;
export let ApplicationCommandIndexStore: GenericStore;

export let ClientThemesBackgroundStore: t.ClientThemesBackgroundStore;
export let ApplicationStreamingStore: t.ApplicationStreamingStore;
export let ApplicationStreamPreviewStore: t.ApplicationStreamPreviewStore;
export let MediaEngineStore: t.MediaEngineStore;
export let OverlayRTCConnectionStore: t.OverlayRTCConnectionStore;
export let RunningGameStore: t.RunningGameStore;
export let UploadStore: t.UploadStore;
export let ThreadMemberListStore: t.ThreadMemberListStore;
export let UserAffinitiesV2Store: t.UserAffinitiesV2Store;
export let PrivateChannelSortStore: t.PrivateChannelSortStore;

export let UserSettingsProtoStore: t.UserSettingsProtoStore;
export let GuildStore: t.GuildStore;
export let AuthSessionsStore: t.AuthSessionsStore;
export let SessionsStore: t.SessionsStore;
export let QuestsStore: t.QuestsStore;
export let GuildMemberCountStore: t.GuildMemberCountStore;
export let UserGuildSettingsStore: t.UserGuildSettingsStore;
export let GuildRoleStore: t.GuildRoleStore;
export let ChannelMemberStore: t.ChannelMemberStore;
export let GuildMemberStore: t.GuildMemberStore;
export let UserStore: t.UserStore;
export let ChannelRTCStore: t.ChannelRTCStore;
export let AuthenticationStore: t.AuthenticationStore;
export let UserProfileStore: t.UserProfileStore;
export let ExpandedGuildFolderStore: t.ExpandedGuildFolderStore;
export let GuildAvailabilityStore: t.GuildAvailabilityStore;
export let ActiveJoinedThreadsStore: t.ActiveJoinedThreadsStore;
export let UserGuildJoinRequestStore: t.UserGuildJoinRequestStore;

export let SelectedChannelStore: t.SelectedChannelStore;
export let SortedGuildStore: t.SortedGuildStore;
export let SelectedGuildStore: t.SelectedGuildStore;
export let ChannelStore: t.ChannelStore;
export let TypingStore: t.TypingStore;
export let RelationshipStore: t.RelationshipStore;
export let VoiceStateStore: t.VoiceStateStore;

export let EmojiStore: t.EmojiStore;
export let StickersStore: t.StickersStore;
export let ThemeStore: t.ThemeStore;
export let WindowStore: t.WindowStore;
export let DraftStore: t.DraftStore;
export let StreamerModeStore: t.StreamerModeStore;

/**
 * @see jsdoc of {@link t.useStateFromStores}
 */
export const useStateFromStores: t.useStateFromStores = findByCodeLazy("useStateFromStores");
waitForStore("ActiveJoinedThreadsStore", s => ActiveJoinedThreadsStore = s);
waitForStore("ApplicationCommandIndexStore", m => ApplicationCommandIndexStore = m);
waitForStore("ApplicationStreamPreviewStore", s => ApplicationStreamPreviewStore = s);
waitForStore("ApplicationStreamingStore", s => ApplicationStreamingStore = s);
waitForStore("AuthSessionsStore", m => AuthSessionsStore = m);
waitForStore("AuthenticationStore", s => AuthenticationStore = s);
waitForStore("ChannelMemberStore", s => ChannelMemberStore = s);
waitForStore("ChannelRTCStore", m => ChannelRTCStore = m);
waitForStore("ChannelStore", m => ChannelStore = m);
waitForStore("ClientThemesBackgroundStore", s => ClientThemesBackgroundStore = s);
waitForStore("DraftStore", s => DraftStore = s);
waitForStore("EmojiStore", m => EmojiStore = m);
waitForStore("ExpandedGuildFolderStore", m => ExpandedGuildFolderStore = m);
waitForStore("GuildAvailabilityStore", m => GuildAvailabilityStore = m);
waitForStore("GuildChannelStore", m => GuildChannelStore = m);
waitForStore("GuildMemberCountStore", m => GuildMemberCountStore = m);
waitForStore("GuildMemberStore", m => GuildMemberStore = m);
waitForStore("GuildRoleStore", m => GuildRoleStore = m);
waitForStore("GuildStore", m => GuildStore = m);
waitForStore("MediaEngineStore", s => MediaEngineStore = s);
waitForStore("MessageStore", m => MessageStore = m);
waitForStore("OverlayRTCConnectionStore", m => OverlayRTCConnectionStore = m);
waitForStore("PermissionStore", m => PermissionStore = m);
waitForStore("PresenceStore", m => PresenceStore = m);
waitForStore("PrivateChannelSortStore", m => PrivateChannelSortStore = m);
waitForStore("QuestsStore", s => QuestsStore = s);
waitForStore("ReadStateStore", m => ReadStateStore = m);
waitForStore("RelationshipStore", m => RelationshipStore = m);
waitForStore("RunningGameStore", m => RunningGameStore = m);
waitForStore("SelectedChannelStore", m => SelectedChannelStore = m);
waitForStore("SelectedGuildStore", m => SelectedGuildStore = m);
waitForStore("SessionsStore", s => SessionsStore = s);
waitForStore("SortedGuildStore", m => SortedGuildStore = m);
waitForStore("StickersStore", m => StickersStore = m);
waitForStore("StreamerModeStore", m => StreamerModeStore = m);
waitForStore("ThemeStore", m => {
    ThemeStore = m;
    Velocity.QuickCss.initQuickCssThemeStore();
});
waitForStore("ThreadMemberListStore", m => ThreadMemberListStore = m);
waitForStore("TypingStore", m => TypingStore = m);
waitForStore("UploadStore", s => UploadStore = s);
waitForStore("UserAffinitiesV2Store", m => UserAffinitiesV2Store = m);
waitForStore("UserGuildJoinRequestStore", s => UserGuildJoinRequestStore = s);
waitForStore("UserGuildSettingsStore", m => UserGuildSettingsStore = m);
waitForStore("UserProfileStore", m => UserProfileStore = m);
waitForStore("UserSettingsProtoStore", s => UserSettingsProtoStore = s);
waitForStore("UserStore", s => UserStore = s);
waitForStore("VoiceStateStore", m => VoiceStateStore = m);
waitForStore("WindowStore", m => WindowStore = m);

