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

import { classNameFactory } from "@api/Styles";
import { Text } from "@components/BaseText";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { ApplicationStreamingStore, i18n, RelationshipStore, Tooltip, UserStore, useStateFromStores } from "@webpack/common";

interface WatchingProps {
    userIds: string[];
    guildId?: any;
}

const cl = classNameFactory("whosWatching-");

function Watching({ userIds, guildId }: WatchingProps) {
    let missingUsers = 0;

    const users = userIds
        .map(id => UserStore.getUser(id))
        .filter(user => user ? true : (missingUsers += 1, false));

    return (
        <div className={cl("content")}>
            {userIds.length ? (
                <>
                    <Text className={Margins.bottom16} variant="heading-sm/semibold">
                        {userIds.length} SPECTATORS
                    </Text>

                    <Flex flexDirection="column" style={{ gap: 6 }}>
                        {users.map(user => (
                            <Flex key={user.id}
                                flexDirection="row"
                                style={{ gap: 6, alignContent: "center" }}
                                className={cl("user")}
                            >
                                <img
                                    src={user.getAvatarURL(guildId)}
                                    alt=""
                                    style={{ borderRadius: 8, width: 16, height: 16 }}
                                />
                                {RelationshipStore.getNickname(user.id) ||
                                    user.globalName ||
                                    user.username}
                            </Flex>
                        ))}

                        {missingUsers > 0 && (
                            <span className={cl("more_users")}>
                                +{i18n.intl.format(i18n.t.NUM_USERS, { num: missingUsers })}
                            </span>
                        )}
                    </Flex>
                </>
            ) : (
                <span className={cl("no_viewers")}>No spectators</span>
            )}
        </div>
    );
}

export default definePlugin({
    name: "WhosWatching",
    description: "Show spectators when hovering your screenshare icon",
    authors: [Devs.Velocity],

    patches: [
        {
            find: ".Masks.STATUS_SCREENSHARE,width:32",
            replacement: {
                match: /jsx\)\((\i\.\i),{mask:/,
                replace: "jsx)($self.component({OriginalComponent:$1}),{mask:"
            }
        }
    ],

    component: function ({ OriginalComponent }) {
        return ErrorBoundary.wrap((props: any) => {
            const stream = useStateFromStores(
                [ApplicationStreamingStore],
                () => ApplicationStreamingStore.getCurrentUserActiveStream()
            );

            if (!stream) return null;

            const viewers = ApplicationStreamingStore.getViewerIds(stream);

            return (
                <Tooltip text={<Watching userIds={viewers} guildId={stream.guildId} />}>
                    {({ onMouseEnter, onMouseLeave }) => (
                        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                            <OriginalComponent {...props} />
                        </div>
                    )}
                </Tooltip>
            );
        });
    }
});
