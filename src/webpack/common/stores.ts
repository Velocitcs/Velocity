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

export let PermissionStore: t.PermissionStore;
export let ReadStateStore: GenericStore;
export let PresenceStore: t.PresenceStore;
export let ApplicationCommandIndexStore: t.ApplicationCommandIndexStore;

export let GuildChannelStore: t.GuildChannelStore;
export let ActiveChannelsStore: t.ActiveChannelsStore;
export let ActiveJoinedThreadsStore: t.ActiveJoinedThreadsStore;
export let ActivityInviteEducationStore: t.ActivityInviteEducationStore;
export let ActivityInviteModalStore: t.ActivityInviteModalStore;
export let ActivityLauncherStore: t.ActivityLauncherStore;
export let ActivityShelfStore: t.ActivityShelfStore;
export let GuildMemberStore: t.GuildMemberStore;
export let ActivityTrackingStore: t.ActivityTrackingStore;
export let AdyenStore: t.AdyenStore;
export let AgeVerificationStore: t.AgeVerificationStore;
export let AnalyticsLogStore: t.AnalyticsLogStore;
export let ApexExperimentStore: t.ApexExperimentStore;
export let AppIconPersistedStoreState: t.AppIconPersistedStoreState;
export let AppLauncherLastUsedCommandStore: t.AppLauncherLastUsedCommandStore;
export let AppLauncherStore: t.AppLauncherStore;
export let AppViewStore: t.AppViewStore;
export let ApplicationAssetsStore: t.ApplicationAssetsStore;
export let ApplicationBuildStore: t.ApplicationBuildStore;
export let ApplicationCommandAutocompleteStore: t.ApplicationCommandAutocompleteStore;
export let ApplicationCommandFrecencyStore: t.ApplicationCommandFrecencyStore;
export let ApplicationCommandStore: t.ApplicationCommandStore;
export let ApplicationDirectoryApplicationsStore: t.ApplicationDirectoryApplicationsStore;
export let ApplicationDirectoryCategoriesStore: t.ApplicationDirectoryCategoriesStore;
export let ApplicationDirectorySearchStore: t.ApplicationDirectorySearchStore;
export let ApplicationDirectorySimilarApplicationsStore: t.ApplicationDirectorySimilarApplicationsStore;
export let ApplicationStatisticsStore: t.ApplicationStatisticsStore;
export let ApplicationStore: t.ApplicationStore;
export let ApplicationStreamingSettingsStore: t.ApplicationStreamingSettingsStore;
export let ApplicationStreamingStore: t.ApplicationStreamingStore;
export let ApplicationStreamPreviewStore: t.ApplicationStreamPreviewStore;
export let ApplicationStoreDirectoryStore: t.ApplicationStoreDirectoryStore;
export let ApplicationStoreLocationStore: t.ApplicationStoreLocationStore;
export let ApplicationStoreSettingsStore: t.ApplicationStoreSettingsStore;
export let ApplicationStoreUserSettingsStore: t.ApplicationStoreUserSettingsStore;
export let ApplicationSubscriptionChannelNoticeStore: t.ApplicationSubscriptionChannelNoticeStore;
export let ApplicationSubscriptionStore: t.ApplicationSubscriptionStore;
export let ApplicationViewStore: t.ApplicationViewStore;
export let AppliedGuildBoostStore: t.AppliedGuildBoostStore;
export let ArchivedThreadsStore: t.ArchivedThreadsStore;
export let AuthenticationStore: t.AuthenticationStore;
export let AuthInviteStore: t.AuthInviteStore;
export let AuthSessionsStore: t.AuthSessionsStore;
export let AuthorizedAppsStore: t.AuthorizedAppsStore;
export let AutoUpdateStore: t.AutoUpdateStore;
export let AVErrorStore: t.AVErrorStore;
export let BasicGuildStore: t.BasicGuildStore;
export let BillingInfoStore: t.BillingInfoStore;
export let BrowserCheckoutStateStore: t.BrowserCheckoutStateStore;
export let BrowserHandoffStore: t.BrowserHandoffStore;
export let BraintreeStore: t.BraintreeStore;
export let BuildOverrideStore: t.BuildOverrideStore;
export let BurstReactionEffectsStore: t.BurstReactionEffectsStore;
export let CacheStore: t.CacheStore;
export let CallChatToastsStore: t.CallChatToastsStore;
export let CallStore: t.CallStore;
export let CategoryCollapseStore: t.CategoryCollapseStore;
export let CertifiedDeviceStore: t.CertifiedDeviceStore;
export let ChannelFollowingPublishBumpStore: t.ChannelFollowingPublishBumpStore;
export let ChannelFollowerStatsStore: t.ChannelFollowerStatsStore;
export let ChannelListStore: t.ChannelListStore;
export let ChannelListUnreadsStore: t.ChannelListUnreadsStore;
export let ChannelListVoiceCategoryStore: t.ChannelListVoiceCategoryStore;
export let ChannelMemberCountStore: t.ChannelMemberCountStore;
export let ChannelMemberStore: t.ChannelMemberStore;
export let ChannelPinsStore: t.ChannelPinsStore;
export let ChannelRTCStore: t.ChannelRTCStore;
export let ChannelSectionStore: t.ChannelSectionStore;
export let ChannelStore: t.ChannelStore;
export let ClientThemesBackgroundStore: t.ClientThemesBackgroundStore;
export let ConnectedAccountsStore: t.ConnectedAccountsStore;
export let ContextMenuStore: t.ContextMenuStore;
export let ContentInventoryActivityStore: t.ContentInventoryActivityStore;
export let ContentInventoryDevToolsStore: t.ContentInventoryDevToolsStore;
export let DevToolsSettingsStore: t.DevToolsSettingsStore;
export let DeveloperExperimentStore: t.DeveloperExperimentStore;
export let DeveloperOptionsStore: t.DeveloperOptionsStore;
export let DeviceFrecencyStore: t.DeviceFrecencyStore;
export let DraftStore: t.DraftStore;
export let EditMessageStore: t.EditMessageStore;
export let EmailSettingsStore: t.EmailSettingsStore;
export let EmojiStore: t.EmojiStore;
export let EntitlementStore: t.EntitlementStore;
export let ExpandedGuildFolderStore: t.ExpandedGuildFolderStore;
export let ExperimentStore: t.ExperimentStore;
export let FavoriteStore: t.FavoriteStore;
export let FavoritesSuggestionStore: t.FavoritesSuggestionStore;
export let FriendsStore: t.FriendsStore;
export let GuildAvailabilityStore: t.GuildAvailabilityStore;
export let GuildBoostSlotStore: t.GuildBoostSlotStore;
export let GuildCategoryStore: t.GuildCategoryStore;
export let GuildMemberCountStore: t.GuildMemberCountStore;
export let GuildOnboardingStore: t.GuildOnboardingStore;
export let GuildRoleStore: t.GuildRoleStore;
export let GuildSettingsStore: t.GuildSettingsStore;
export let GuildStore: t.GuildStore;
export let IdleStore: t.IdleStore;
export let IncomingCallStore: t.IncomingCallStore;
export let LibraryApplicationStatisticsStore: t.LibraryApplicationStatisticsStore;
export let MediaEngineStore: t.MediaEngineStore;
export let MessageReactionsStore: t.MessageReactionsStore;
export let MessageRequestStore: t.MessageRequestStore;
export let NetworkStore: t.NetworkStore;
export let NoteStore: t.NoteStore;
export let OverlayRTCConnectionStore: t.OverlayRTCConnectionStore;
export let PhoneStore: t.PhoneStore;
export let PrivateChannelSortStore: t.PrivateChannelSortStore;
export let PromotionsStore: t.PromotionsStore;
export let QuestStore: t.QuestStore;
export let RegionStore: t.RegionStore;
export let RelationshipStore: t.RelationshipStore;
export let RunningGameStore: t.RunningGameStore;
export let SelectedChannelStore: t.SelectedChannelStore;
export let SelectedGuildStore: t.SelectedGuildStore;
export let SessionsStore: t.SessionsStore;
export let SortedGuildStore: t.SortedGuildStore;
export let SpeakingStore: t.SpeakingStore;
export let StickersStore: t.StickersStore;
export let StreamerModeStore: t.StreamerModeStore;
export let ThemeStore: t.ThemeStore;
export let ThreadMemberListStore: t.ThreadMemberListStore;
export let TypingStore: t.TypingStore;
export let UploadAttachmentStore: t.UploadAttachmentStore;
export let UploadStore: t.UploadStore;
export let UserAffinitiesV2Store: t.UserAffinitiesV2Store;
export let UserGuildJoinRequestStore: t.UserGuildJoinRequestStore;
export let UserGuildSettingsStore: t.UserGuildSettingsStore;
export let UserOfferStore: t.UserOfferStore;
export let UserProfileStore: t.UserProfileStore;
export let UserSettingsProtoStore: t.UserSettingsProtoStore;
export let UserStore: t.UserStore;
export let VerifiedKeyStore: t.VerifiedKeyStore;

export let VoiceStateStore: t.VoiceStateStore;
export let WindowStore: t.WindowStore;
export let WowMomentConfirmationStore: t.WowMomentConfirmationStore;

/**
 * @see jsdoc of {@link t.useStateFromStores}
 */
export const useStateFromStores: t.useStateFromStores = findByCodeLazy("useStateFromStores");

waitForStore("ActiveChannelsStore", s => ActiveChannelsStore = s);
waitForStore("ActiveJoinedThreadsStore", s => ActiveJoinedThreadsStore = s);
waitForStore("ActivityInviteEducationStore", s => ActivityInviteEducationStore = s);
waitForStore("ActivityInviteModalStore", s => ActivityInviteModalStore = s);
waitForStore("ActivityLauncherStore", s => ActivityLauncherStore = s);
waitForStore("ActivityShelfStore", s => ActivityShelfStore = s);
waitForStore("ActivityTrackingStore", s => ActivityTrackingStore = s);
waitForStore("AdyenStore", s => AdyenStore = s);
waitForStore("AgeVerificationStore", s => AgeVerificationStore = s);
waitForStore("AnalyticsLogStore", s => AnalyticsLogStore = s);
waitForStore("ApexExperimentStore", s => ApexExperimentStore = s);
waitForStore("AppIconPersistedStoreState", s => AppIconPersistedStoreState = s);
waitForStore("AppLauncherLastUsedCommandStore", s => AppLauncherLastUsedCommandStore = s);
waitForStore("AppLauncherStore", s => AppLauncherStore = s);
waitForStore("AppViewStore", s => AppViewStore = s);
waitForStore("ApplicationAssetsStore", s => ApplicationAssetsStore = s);
waitForStore("ApplicationBuildStore", s => ApplicationBuildStore = s);
waitForStore("ApplicationCommandAutocompleteStore", s => ApplicationCommandAutocompleteStore = s);
waitForStore("ApplicationCommandFrecencyStore", s => ApplicationCommandFrecencyStore = s);
waitForStore("ApplicationCommandStore", s => ApplicationCommandStore = s);
waitForStore("ApplicationDirectoryApplicationsStore", s => ApplicationDirectoryApplicationsStore = s);
waitForStore("ApplicationDirectoryCategoriesStore", s => ApplicationDirectoryCategoriesStore = s);
waitForStore("ApplicationDirectorySearchStore", s => ApplicationDirectorySearchStore = s);
waitForStore("ApplicationDirectorySimilarApplicationsStore", s => ApplicationDirectorySimilarApplicationsStore = s);
waitForStore("ApplicationStatisticsStore", s => ApplicationStatisticsStore = s);
waitForStore("ApplicationStore", s => ApplicationStore = s);
waitForStore("ApplicationStreamingSettingsStore", s => ApplicationStreamingSettingsStore = s);
waitForStore("ApplicationStreamingStore", s => ApplicationStreamingStore = s);
waitForStore("ApplicationStreamPreviewStore", s => ApplicationStreamPreviewStore = s);
waitForStore("ApplicationStoreDirectoryStore", s => ApplicationStoreDirectoryStore = s);
waitForStore("ApplicationStoreLocationStore", s => ApplicationStoreLocationStore = s);
waitForStore("ApplicationStoreSettingsStore", s => ApplicationStoreSettingsStore = s);
waitForStore("ApplicationStoreUserSettingsStore", s => ApplicationStoreUserSettingsStore = s);
waitForStore("ApplicationSubscriptionChannelNoticeStore", s => ApplicationSubscriptionChannelNoticeStore = s);
waitForStore("ApplicationSubscriptionStore", s => ApplicationSubscriptionStore = s);
waitForStore("ApplicationViewStore", s => ApplicationViewStore = s);
waitForStore("AppliedGuildBoostStore", s => AppliedGuildBoostStore = s);
waitForStore("ArchivedThreadsStore", s => ArchivedThreadsStore = s);
waitForStore("AuthenticationStore", s => AuthenticationStore = s);
waitForStore("AuthInviteStore", s => AuthInviteStore = s);
waitForStore("AuthSessionsStore", s => AuthSessionsStore = s);
waitForStore("AuthorizedAppsStore", s => AuthorizedAppsStore = s);
waitForStore("AutoUpdateStore", s => AutoUpdateStore = s);
waitForStore("AVErrorStore", s => AVErrorStore = s);
waitForStore("BasicGuildStore", s => BasicGuildStore = s);
waitForStore("BillingInfoStore", s => BillingInfoStore = s);
waitForStore("BrowserCheckoutStateStore", s => BrowserCheckoutStateStore = s);
waitForStore("BrowserHandoffStore", s => BrowserHandoffStore = s);
waitForStore("BraintreeStore", s => BraintreeStore = s);
waitForStore("BuildOverrideStore", s => BuildOverrideStore = s);
waitForStore("BurstReactionEffectsStore", s => BurstReactionEffectsStore = s);
waitForStore("CacheStore", s => CacheStore = s);
waitForStore("CallChatToastsStore", s => CallChatToastsStore = s);
waitForStore("CallStore", s => CallStore = s);
waitForStore("CategoryCollapseStore", s => CategoryCollapseStore = s);
waitForStore("CertifiedDeviceStore", s => CertifiedDeviceStore = s);
waitForStore("ChannelFollowingPublishBumpStore", s => ChannelFollowingPublishBumpStore = s);
waitForStore("ChannelFollowerStatsStore", s => ChannelFollowerStatsStore = s);
waitForStore("ChannelListStore", s => ChannelListStore = s);
waitForStore("ChannelListUnreadsStore", s => ChannelListUnreadsStore = s);
waitForStore("ChannelListVoiceCategoryStore", s => ChannelListVoiceCategoryStore = s);
waitForStore("ChannelMemberCountStore", s => ChannelMemberCountStore = s);
waitForStore("ChannelMemberStore", s => ChannelMemberStore = s);
waitForStore("ChannelPinsStore", s => ChannelPinsStore = s);
waitForStore("ChannelRTCStore", s => ChannelRTCStore = s);
waitForStore("ChannelSectionStore", s => ChannelSectionStore = s);
waitForStore("ChannelStore", s => ChannelStore = s);
waitForStore("ClientThemesBackgroundStore", s => ClientThemesBackgroundStore = s);
waitForStore("ConnectedAccountsStore", s => ConnectedAccountsStore = s);
waitForStore("ContextMenuStore", s => ContextMenuStore = s);
waitForStore("ContentInventoryActivityStore", s => ContentInventoryActivityStore = s);
waitForStore("ContentInventoryDevToolsStore", s => ContentInventoryDevToolsStore = s);
waitForStore("DevToolsSettingsStore", s => DevToolsSettingsStore = s);
waitForStore("DeveloperExperimentStore", s => DeveloperExperimentStore = s);
waitForStore("DeveloperOptionsStore", s => DeveloperOptionsStore = s);
waitForStore("DeviceFrecencyStore", s => DeviceFrecencyStore = s);
waitForStore("DraftStore", s => DraftStore = s);
waitForStore("EditMessageStore", s => EditMessageStore = s);
waitForStore("EmailSettingsStore", s => EmailSettingsStore = s);
waitForStore("EmojiStore", s => EmojiStore = s);
waitForStore("EntitlementStore", s => EntitlementStore = s);
waitForStore("ExpandedGuildFolderStore", s => ExpandedGuildFolderStore = s);
waitForStore("ExperimentStore", s => ExperimentStore = s);
waitForStore("FavoriteStore", s => FavoriteStore = s);
waitForStore("FavoritesSuggestionStore", s => FavoritesSuggestionStore = s);
waitForStore("FriendsStore", s => FriendsStore = s);
waitForStore("GuildAvailabilityStore", s => GuildAvailabilityStore = s);
waitForStore("GuildBoostSlotStore", s => GuildBoostSlotStore = s);
waitForStore("GuildCategoryStore", s => GuildCategoryStore = s);
waitForStore("GuildChannelStore", s => GuildChannelStore = s);
waitForStore("GuildMemberCountStore", s => GuildMemberCountStore = s);
waitForStore("GuildMemberStore", s => GuildMemberStore = s);
waitForStore("GuildOnboardingStore", s => GuildOnboardingStore = s);
waitForStore("GuildRoleStore", s => GuildRoleStore = s);
waitForStore("GuildSettingsStore", s => GuildSettingsStore = s);
waitForStore("GuildStore", s => GuildStore = s);
waitForStore("IdleStore", s => IdleStore = s);
waitForStore("IncomingCallStore", s => IncomingCallStore = s);
waitForStore("LibraryApplicationStatisticsStore", s => LibraryApplicationStatisticsStore = s);
waitForStore("MediaEngineStore", s => MediaEngineStore = s);
waitForStore("MessageReactionsStore", s => MessageReactionsStore = s);
waitForStore("MessageStore", s => MessageStore = s);
waitForStore("MessageRequestStore", s => MessageRequestStore = s);
waitForStore("NetworkStore", s => NetworkStore = s);
waitForStore("NoteStore", s => NoteStore = s);
waitForStore("OverlayRTCConnectionStore", s => OverlayRTCConnectionStore = s);
waitForStore("PhoneStore", s => PhoneStore = s);
waitForStore("PermissionStore", s => PermissionStore = s);
waitForStore("PresenceStore", s => PresenceStore = s);
waitForStore("PrivateChannelSortStore", s => PrivateChannelSortStore = s);
waitForStore("PromotionsStore", s => PromotionsStore = s);
waitForStore("QuestStore", s => QuestStore = s);
waitForStore("ReadStateStore", s => ReadStateStore = s);
waitForStore("RegionStore", s => RegionStore = s);
waitForStore("RelationshipStore", s => RelationshipStore = s);
waitForStore("RunningGameStore", s => RunningGameStore = s);
waitForStore("SelectedChannelStore", s => SelectedChannelStore = s);
waitForStore("SelectedGuildStore", s => SelectedGuildStore = s);
waitForStore("SessionsStore", s => SessionsStore = s);
waitForStore("SortedGuildStore", s => SortedGuildStore = s);
waitForStore("SpeakingStore", s => SpeakingStore = s);
waitForStore("StickersStore", s => StickersStore = s);
waitForStore("StreamerModeStore", s => StreamerModeStore = s);
waitForStore("ThemeStore", m => {
    ThemeStore = m;
    Velocity.Api.Themes.initQuickCssThemeStore(m);
});
waitForStore("ThreadMemberListStore", s => ThreadMemberListStore = s);
waitForStore("TypingStore", s => TypingStore = s);
waitForStore("UploadStore", s => UploadStore = s);
waitForStore("UploadAttachmentStore", s => UploadAttachmentStore = s);
waitForStore("UserAffinitiesV2Store", s => UserAffinitiesV2Store = s);
waitForStore("UserGuildJoinRequestStore", s => UserGuildJoinRequestStore = s);
waitForStore("UserGuildSettingsStore", s => UserGuildSettingsStore = s);
waitForStore("UserProfileStore", s => UserProfileStore = s);
waitForStore("UserSettingsProtoStore", s => UserSettingsProtoStore = s);
waitForStore("UserStore", s => UserStore = s);
waitForStore("UserOfferStore", s => UserOfferStore = s);
waitForStore("VerifiedKeyStore", s => VerifiedKeyStore = s);
waitForStore("VoiceStateStore", s => VoiceStateStore = s);
waitForStore("WindowStore", s => WindowStore = s);
waitForStore("WowMomentConfirmationStore", s => WowMomentConfirmationStore = s);
