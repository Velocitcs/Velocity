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
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { Card, FormNotice, Forms, TextArea, useState } from "@webpack/common";

export function OnlineThemesTab() {
    const settings = useSettings(["themeLinks"]);

    const [themeText, setThemeText] = useState(settings.themeLinks.join("\n"));

    function onBlur() {
        const newLinks = [...new Set(
            themeText
                .trim()
                .split(/\n+/)
                .map(s => s.trim())
                .filter(Boolean)
        )];

        if (JSON.stringify(newLinks) !== JSON.stringify(settings.themeLinks)) {
            settings.themeLinks = newLinks;
        }
    }

    return (
        <>
            <FormNotice textVariant="text-lg/normal" messageType="warn" className={Margins.bottom16}>
                This section is for advanced users. <br></br> If you are having difficulties using it, use the local Themes tab instead.
            </FormNotice>
            <Card className="vc-settings-card">
                <Forms.FormTitle tag="h5">Paste links to css files here</Forms.FormTitle>
                <Paragraph>One link per line</Paragraph>
                <Paragraph>You can prefix lines with @light or @dark to toggle them based on your Discord theme</Paragraph>
                <Paragraph>Make sure to use direct links to files (raw or github.io)!</Paragraph>
            </Card>

            <Forms.FormSection tag="h5" title="Online Themes">
                <TextArea
                    value={themeText}
                    onChange={setThemeText}
                    className={"vc-settings-theme-links"}
                    placeholder="Enter Theme Links..."
                    spellCheck={false}
                    onBlur={onBlur}
                    rows={10}
                />
            </Forms.FormSection>
        </>
    );
}
