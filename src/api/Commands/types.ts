/*
 * Velocity, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Command } from "@discord-types";
export { ApplicationCommandInputType, ApplicationCommandOptionType, ApplicationCommandType } from "@discord-types/enums";

export interface VencordCommand extends Command {
    isVencordCommand?: boolean;
}
