export const enum ContextMenuType {
    /**
     * Developer context menu (shown when right-clicking with developer mode enabled)
     *
     * Value: "dev-context"
     * Shown: When right-clicking elements with developer mode on
     * Common Actions: Copy ID, Copy URL, View Channel Object, etc.
     */
    DEV_CONTEXT = "dev-context",

    /**
     * User context menu (shown when right-clicking a user)
     *
     * Value: "user-context"
     * Shown: When right-clicking on a user's avatar, name, or profile
     * Common Actions: Mention, Message, Call, Add Friend, Block, Kick, Ban, etc.
     */
    USER_CONTEXT = "user-context",

    /**
     * Stream context menu (shown when right-clicking a stream)
     *
     * Value: "stream-context"
     * Shown: When right-clicking on an active stream
     * Common Actions: Open in Popout, Watch Stream, etc.
     */
    STREAM_CONTEXT = "stream-context",

    /**
     * Message context menu (shown when right-clicking a message)
     *
     * Value: "message"
     * Shown: When right-clicking on any message in chat
     * Common Actions: Edit, Delete, Pin, Reply, Copy Text, Copy Link, Report, etc.
     */
    MESSAGE = "message",

    /**
     * Expression picker context menu (emoji/sticker/gif picker context)
     *
     * Value: "expression-picker"
     * Shown: When right-clicking in the emoji/sticker/gif picker
     * Common Actions: Add to Favorites, Delete Emoji, Manage Expressions, etc.
     */
    EXPRESSION_PICKER = "expression-picker",

    /**
     * Image context menu (shown when right-clicking an image)
     *
     * Value: "image-context"
     * Shown: When right-clicking on an embedded image or attachment
     * Common Actions: Open in Browser, Save Image, Copy Link, Search Image, etc.
     */
    IMAGE_CONTEXT = "image-context",

    /**
     * Channel context menu (shown when right-clicking a channel)
     *
     * Value: "channel-context"
     * Shown: When right-clicking on a channel in the channel list
     * Common Actions: Mark as Read, Mute Channel, Edit Channel, Delete Channel, Copy Link, etc.
     */
    CHANNEL_CONTEXT = "channel-context",

    /**
     * Thread context menu (shown when right-clicking a thread)
     *
     * Value: "thread-context"
     * Shown: When right-clicking on a thread in the channel list or thread browser
     * Common Actions: Mark as Read, Mute Thread, Leave Thread, Delete Thread, Copy Link, etc.
     */
    THREAD_CONTEXT = "thread-context",

    /**
     * Group DM context menu (shown when right-clicking a group DM)
     *
     * Value: "gdm-context"
     * Shown: When right-clicking on a group DM in the DM list
     * Common Actions: Close DM, Add Friends, Change Icon, Leave Group, Mute, etc.
     */
    GDM_CONTEXT = "gdm-context",

    /**
     * Guild context menu (shown when right-clicking a server)
     *
     * Value: "guild-context"
     * Shown: When right-clicking on a server icon in the server list
     * Common Actions: Mark as Read, Server Settings, Notification Settings, Hide Muted Channels, Leave Server, etc.
     */
    GUILD_CONTEXT = "guild-context",

    /**
     * Guild header popout context menu (shown when clicking the server name dropdown)
     *
     * Value: "guild-header-popout"
     * Shown: When clicking the server name at the top of the channel list
     * Common Actions: Server Boost Status, Server Settings, Create Channel, Create Event, etc.
     */
    GUILD_HEADER_POPOUT = "guild-header-popout",

    /**
     * Text area context menu (shown when right-clicking in a text input)
     *
     * Value: "textarea-context"
     * Shown: When right-clicking in the message input box or any text field
     * Common Actions: Cut, Copy, Paste, Spell Check, Emoji, etc.
     */
    TEXTAREA_CONTEXT = "textarea-context",

    /**
     * Guild settings role context menu (shown when right-clicking a role in server settings)
     *
     * Value: "guild-settings-role-context"
     * Shown: When right-clicking on a role in the server settings role list
     * Common Actions: Edit Role, Duplicate Role, Delete Role, etc.
     */
    GUILD_SETTINGS_ROLE_CONTEXT = "guild-settings-role-context",
}
