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

import { showNotification } from "@api/Notifications";
import { PlainSettings, Settings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { relaunch } from "@utils/native";
import { deflateSync, inflateSync } from "fflate";

import { checkCloudUrlCsp, deauthorizeCloud, getCloudAuth, getCloudUrl } from "./cloudSetup";
import { exportSettings, importSettings } from "./offline";

const logger = new Logger("SettingsSync:Cloud", "#39b7e0");

export async function putCloudSettings(manual?: boolean) {
    const settings = await exportSettings({ minify: true });

    if (!await checkCloudUrlCsp()) return;

    try {
        const res = await fetch(new URL("/v1/settings", getCloudUrl()), {
            method: "PUT",
            headers: {
                Authorization: await getCloudAuth(),
                "Content-Type": "application/octet-stream"
            },
            body: deflateSync(new TextEncoder().encode(settings)) as Uint8Array<ArrayBuffer>
        });

        if (!res.ok) {
            logger.error(`Failed to sync up, API returned ${res.status}`);
            showNotification({
                title: "Cloud Settings",
                body: `Could not synchronize settings to cloud (API returned ${res.status}).`,
                color: "var(--red-360)"
            });
            return;
        }

        const { written } = await res.json();
        PlainSettings.cloud.settingsSyncVersion = written;
        VelocityNative.settings.set(PlainSettings);

        logger.info("Settings uploaded to cloud successfully");

        if (manual) {
            showNotification({
                title: "Cloud Settings",
                body: "Synchronized settings to the cloud!",
                noPersist: true,
            });
        }
    } catch (e: any) {
        logger.error("Failed to sync up", e);
        showNotification({
            title: "Cloud Settings",
            body: `Could not synchronize settings to the cloud (${e.toString()}).`,
            color: "var(--red-360)"
        });
    }
}

export async function getCloudSettings(shouldNotify = true, force = false) {
    if (!await checkCloudUrlCsp()) return;

    try {
        const res = await fetch(new URL("/v1/settings", getCloudUrl()), {
            method: "GET",
            headers: {
                Authorization: await getCloudAuth(),
                Accept: "application/octet-stream",
                "If-None-Match": Settings.cloud.settingsSyncVersion.toString()
            },
        });

        if (res.status === 404) {
            logger.info("No settings on the cloud");
            if (shouldNotify)
                showNotification({
                    title: "Cloud Settings",
                    body: "There are no settings in the cloud.",
                    noPersist: true
                });
            return false;
        }

        if (res.status === 304) {
            logger.info("Settings up to date");
            if (shouldNotify)
                showNotification({
                    title: "Cloud Settings",
                    body: "Your settings are up to date.",
                    noPersist: true
                });
            return false;
        }

        if (!res.ok) {
            logger.error(`Failed to sync down, API returned ${res.status}`);
            showNotification({
                title: "Cloud Settings",
                body: `Could not synchronize settings from the cloud (API returned ${res.status}).`,
                color: "var(--red-360)"
            });
            return false;
        }

        const written = Number(res.headers.get("etag")!);
        const localWritten = Settings.cloud.settingsSyncVersion;

        // don't need to check for written > localWritten because the server will return 304 due to if-none-match
        if (!force && written < localWritten) {
            if (shouldNotify)
                showNotification({
                    title: "Cloud Settings",
                    body: "Your local settings are newer than the cloud ones.",
                    noPersist: true,
                });
            return;
        }

        const data = await res.arrayBuffer();

        const settings = new TextDecoder().decode(inflateSync(new Uint8Array(data)));
        await importSettings(settings);

        // sync with server timestamp instead of local one
        PlainSettings.cloud.settingsSyncVersion = written;
        VelocityNative.settings.set(PlainSettings);

        logger.info("Settings loaded from cloud successfully");
        if (shouldNotify)
            showNotification({
                title: "Cloud Settings",
                body: "Your settings have been updated! Click here to restart to fully apply changes!",
                color: "var(--green-360)",
                onClick: IS_WEB ? () => location.reload() : relaunch,
                noPersist: true
            });

        return true;
    } catch (e: any) {
        logger.error("Failed to sync down", e);
        showNotification({
            title: "Cloud Settings",
            body: `Could not synchronize settings from the cloud (${e.toString()}).`,
            color: "var(--red-360)"
        });

        return false;
    }
}

export async function deleteCloudSettings() {
    if (!await checkCloudUrlCsp()) return;

    try {
        const res = await fetch(new URL("/v1/settings", getCloudUrl()), {
            method: "DELETE",
            headers: { Authorization: await getCloudAuth() },
        });

        if (!res.ok) {
            logger.error(`Failed to delete, API returned ${res.status}`);
            showNotification({
                title: "Cloud Settings",
                body: `Could not delete settings (API returned ${res.status}).`,
                color: "var(--red-360)"
            });
            return;
        }

        logger.info("Settings deleted from cloud successfully");
        showNotification({
            title: "Cloud Settings",
            body: "Settings deleted from cloud!",
            color: "var(--green-360)"
        });
    } catch (e: any) {
        logger.error("Failed to delete", e);
        showNotification({
            title: "Cloud Settings",
            body: `Could not delete settings (${e.toString()}).`,
            color: "var(--red-360)"
        });
    }
}

export async function eraseAllCloudData() {
    if (!await checkCloudUrlCsp()) return;

    const res = await fetch(new URL("/v1/", getCloudUrl()), {
        method: "DELETE",
        headers: { Authorization: await getCloudAuth() }
    });

    if (!res.ok) {
        logger.error(`Failed to erase data, API returned ${res.status}`);
        showNotification({
            title: "Cloud Integrations",
            body: `Could not erase all data (API returned ${res.status}), please contact support.`,
            color: "var(--red-360)"
        });
        return;
    }

    Settings.cloud.authenticated = false;
    await deauthorizeCloud();

    showNotification({
        title: "Cloud Integrations",
        body: "Successfully erased all data.",
        color: "var(--green-360)"
    });
}
