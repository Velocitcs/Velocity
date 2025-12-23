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

import { definePluginSettings } from "@api/Settings";
import { AddonBadge, AddonBadgeTypes } from "@components/settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { WindowStore } from "@webpack/common";

import managedStyle from "./styles.css?managed";

const settings = definePluginSettings({
    maxSize: {
        description: "Maximum snowflake size",
        type: OptionType.SLIDER,
        default: 30,
        markers: [10, 20, 30, 40, 50]
    },
    speed: {
        description: "Snowfall speed (higher = faster fall)",
        type: OptionType.SLIDER,
        default: 50,
        markers: [50, 100, 200, 300, 400, 500]
    },
    flakesPerSecond: {
        description: "Snowflakes per second (higher = denser snowfall)",
        type: OptionType.SLIDER,
        default: 5,
        markers: [1, 5, 10, 20, 40, 60],
        min: 1,
        max: 60
    }
});

class SnowfallManager {
    private $snowfield = (() => { const el = document.createElement("div"); el.id = "velocity-snowfield"; return document.body.appendChild(el), el; })();
    private queue: HTMLElement[] = [];
    private lastFlakeTime = Date.now();
    private animationId = 0;

    constructor() {
        window.addEventListener("resize", () => this.loop());
        this.animationId = requestAnimationFrame(this.loop);
    }

    private createSnowflake() {
        const el = document.createElement("div");
        el.className = "vc-snowflake";
        el.textContent = "❄";
        return el;
    }

    private loop = () => {
        if (!WindowStore.isFocused()) {
            this.animationId = requestAnimationFrame(this.loop);
            return;
        }

        const now = Date.now();
        if (now - this.lastFlakeTime >= 1000 / settings.store.flakesPerSecond) {
            const size = Math.random() * (settings.store.maxSize - 10) + 10;
            const duration = (window.innerHeight * 10) / (settings.store.speed / 50);
            const flake = this.queue.shift() || this.createSnowflake();

            flake.style.cssText = `top:-${size * 2}px;left:${Math.random() * window.innerWidth}px;opacity:${Math.random() * 0.5 + 0.5};font-size:${size}px;transform:none;transition:${duration}ms linear`;
            this.$snowfield.appendChild(flake);

            requestAnimationFrame(() => {
                flake.style.transform = `translate(${Math.random() * 200 - 100}px,${window.innerHeight + size * 2}px) rotate(${Math.random() * window.innerHeight * 0.8}deg)`;
                flake.style.opacity = "0";
            });

            setTimeout(() => {
                flake.style.transition = "none";
                flake.style.transform = "none";
                this.queue.push(flake);
            }, duration);

            this.lastFlakeTime = now;
        }

        this.animationId = requestAnimationFrame(this.loop);
    };

    destroy() {
        cancelAnimationFrame(this.animationId);
        this.$snowfield.remove();
    }
}

export default definePlugin({
    name: "Snowfall",
    description: "Let it snow on Discord!",
    authors: [Devs.Velocity],

    settings,
    managedStyle,

    start() {
        this.snow = new SnowfallManager();
    },

    stop() {
        this.snow?.destroy();
    },

    renderBadge: () => <AddonBadge text="CHRISTMAS" type={AddonBadgeTypes.CUSTOM} backgroundColor="#005cfaff" />,
});
