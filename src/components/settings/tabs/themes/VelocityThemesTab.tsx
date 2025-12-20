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

import { useSettings } from "@api/Settings";
import { classNameFactory } from "@api/Styles";
import { Text } from "@components/BaseText";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { Margins } from "@components/margins";
import { classes } from "@utils/misc";
import { Card, FormNotice, Forms } from "@webpack/common";

const cl = classNameFactory("vc-settings-themes-");

export function VelocityThemesTab() {
    const { velocityStyles } = useSettings(["velocityStyles.*"]);

    const switches: Array<{ title: string; description: string; setting: keyof typeof velocityStyles; }> = [
        { title: "Redesigned Switch", description: "A theme for the redesigned switch", setting: "switchRedesign" },
        { title: "Redesigned Select", description: "A theme for the new mana select", setting: "selectRedesign" }
    ];

    return (
        <>
            <Card className={classes("vc-settings-card", "vc-warning-card")}>
                <Flex flexDirection="column">
                    <strong>Notice</strong>
                    <span>Velocity themes are built in themes for customizations. <br></br> This is an experimental feature so this might break!!</span>
                </Flex>
            </Card>
            <Forms.FormDivider className={Margins.bottom16} />

            <Forms.FormSection title="Velocity Themes" tag="h5">
                {switches.map(sw => (
                    <Card key={sw.setting} className="vc-settings-card">
                        <FormSwitch
                            title={sw.title}
                            description={sw.description}
                            value={velocityStyles[sw.setting] ?? false}
                            hideBorder={true}
                            onChange={value => {
                                velocityStyles[sw.setting] = value;
                            }}
                        />
                    </Card>
                ))}
                <Divider />
                <Flex flexDirection="column" justifyContent="center" alignItems="center" gap="0.25em">
                    <Text variant="text-lg/semibold">
                        More themes coming soon!
                    </Text>
                    <Text className={cl("secondaryText")}>
                        This is still in production
                    </Text>
                </Flex>
            </Forms.FormSection>
        </>
    );
}
