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

import { copyWithToast } from "@utils/discord";
import { Embed, EmbedJSON, Message } from "@velocity-types";
import { Toasts } from "@webpack/common";

type CopyType = "embed" | "full" | "description" | "builder";

export function parseDiscordColor(colorValue: string): number | null {
    if (typeof colorValue === "number") return colorValue;
    if (typeof colorValue === "string") {
        if (colorValue.startsWith("#")) return parseInt(colorValue.slice(1), 16);
        const hexMatch = colorValue.match(/^[0-9A-Fa-f]{6}$/);
        if (hexMatch) return parseInt(colorValue, 16);

        const hslMatch = colorValue.match(/hsla?\((\d+),.*?(\d+(?:\.\d+)?)%.*?(\d+(?:\.\d+)?)%/);
        if (hslMatch) {
            const h = parseInt(hslMatch[1]) / 360;
            const s = parseFloat(hslMatch[2]) / 100;
            const l = parseFloat(hslMatch[3]) / 100;
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
            const g = Math.round(hue2rgb(p, q, h) * 255);
            const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
            return (r << 16) + (g << 8) + b;
        }
    }
    return null;
}

export function cleanEmbed(embed: Embed) {
    const e: any = {};
    if (embed.rawTitle) e.title = embed.rawTitle;
    if (embed.rawDescription) e.description = embed.rawDescription;
    if (embed.url) e.url = embed.url;
    if (embed.color) {
        const parsedColor = parseDiscordColor(embed.color);
        if (parsedColor !== null) e.color = parsedColor;
    }
    if (embed.timestamp) e.timestamp = embed.timestamp;
    if (embed.footer) {
        e.footer = {};
        if (embed.footer.text || embed.footer.rawText) e.footer.text = embed.footer.text || embed.footer.rawText;
        if (embed.footer.iconURL || embed.footer.iconURL) e.footer.icon_url = embed.footer.iconURL || embed.footer.iconURL;
    }
    if (embed.author) {
        e.author = {};
        if (embed.author.name || embed.author.rawName) e.author.name = embed.author.name || embed.author.rawName;
        if (embed.author.url) e.author.url = embed.author.url;
        if (embed.author.iconURL || embed.author.iconURL) e.author.icon_url = embed.author.iconURL || embed.author.iconURL;
    }
    if (embed.thumbnail?.url) e.thumbnail = { url: embed.thumbnail.url };
    if (embed.image?.url) e.image = { url: embed.image.url };
    if (embed.fields?.length) {
        e.fields = embed.fields.map((f: any) => ({
            name: f.name || f.rawName || "",
            value: f.value || f.rawValue || "",
            inline: f.inline || false
        }));
    }
    return e;
}

export function generateEmbedBuilder(embed: EmbedJSON): string {
    const lines = ["const embed = new EmbedBuilder()"];

    if (embed.title) lines.push(`  .setTitle(${JSON.stringify(embed.title)})`);
    if (embed.description) lines.push(`  .setDescription(${JSON.stringify(embed.description)})`);
    if (embed.color) lines.push(`  .setColor(${embed.color})`);
    if (embed.url) lines.push(`  .setURL(${JSON.stringify(embed.url)})`);
    if (embed.timestamp) lines.push(`  .setTimestamp(${JSON.stringify(embed.timestamp)})`);

    if (embed.footer?.text) {
        const footerParts = [embed.footer.text];
        if (embed.footer.icon_url) footerParts.push(embed.footer.icon_url);
        lines.push(`  .setFooter({ text: ${JSON.stringify(footerParts[0])}${footerParts[1] ? `, iconURL: ${JSON.stringify(footerParts[1])}` : ""} })`);
    }

    if (embed.author?.name) {
        let author = `{ name: ${JSON.stringify(embed.author.name)}`;
        if (embed.author.icon_url) author += `, iconURL: ${JSON.stringify(embed.author.icon_url)}`;
        if (embed.author.url) author += `, url: ${JSON.stringify(embed.author.url)}`;
        author += " }";
        lines.push(`  .setAuthor(${author})`);
    }

    if (embed.thumbnail?.url) lines.push(`  .setThumbnail(${JSON.stringify(embed.thumbnail.url)})`);
    if (embed.image?.url) lines.push(`  .setImage(${JSON.stringify(embed.image.url)})`);

    if (embed.fields?.length) {
        embed.fields.forEach(f => {
            lines.push(`  .addFields({ name: ${JSON.stringify(f.name)}, value: ${JSON.stringify(f.value)}, inline: ${f.inline} })`);
        });
    }

    lines[lines.length - 1] += ";";
    return lines.join("\n");
}

export function copyEmbedContent(msg: Message, type: CopyType, embedIndex: number = 0) {
    if (!msg?.embeds?.length) return;

    const embed = msg.embeds[embedIndex];
    if (!embed) return;

    switch (type) {
        case "embed":
            const cleanEmbeds = msg.embeds.map(cleanEmbed);
            copyWithToast(JSON.stringify({ content: null, embeds: cleanEmbeds, attachments: [] }, null, 2), "Embed JSON copied!");
            break;
        case "full":
            copyWithToast(JSON.stringify(msg, null, 2), "Full message JSON copied!");
            break;
        case "description":
            const desc = embed.rawDescription;
            if (!desc) {
                Toasts.show({ message: `No description in embed ${embedIndex + 1}!`, id: Toasts.genId(), type: Toasts.Type.FAILURE });
                return;
            }
            copyWithToast(desc, `Embed ${embedIndex + 1} description copied!`);
            break;
        case "builder":
            const cleanedEmbed = cleanEmbed(embed);
            const builderCode = generateEmbedBuilder(cleanedEmbed);
            copyWithToast(builderCode, "EmbedBuilder code copied!");
            break;
    }
}
