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
import { Button } from "@components/Button";
import { DeleteIcon, PencilIcon } from "@components/Icons";
import { Paragraph } from "@components/Paragraph";
import { Slider, TabBar, TextInput, Toasts, useRef, useState } from "@webpack/common";

import { getSoundEntries, saveSoundEntries, SoundEntry } from "../settings";

const cl = classNameFactory("vc-betterNotifications-");

const convertFileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const getEntryDisplay = (entry: SoundEntry, isUserTab: boolean) => {
    if (isUserTab) {
        return entry.userLabel || (entry.userId ? entry.displayName || entry.userId : entry.displayName);
    }
    return entry.guildName || entry.guildId;
};

const getEntrySubtext = (entry: SoundEntry, isUserTab: boolean) => {
    if (isUserTab) {
        return entry.userId ? `ID: ${entry.userId}` : `Display Name: ${entry.displayName}`;
    }
    return entry.guildName ? `ID: ${entry.guildId}` : "";
};

export function SoundSettings() {
    const [currentTab, setCurrentTab] = useState<"users" | "guilds">("users");
    const [entries, setEntries] = useState<SoundEntry[]>(getSoundEntries());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [sliderKey, setSliderKey] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({ id: "", name: "", note: "", soundUrl: "", filename: "", volume: 0.5, displayNameMode: false, error: false });

    const saveEntries = (newEntries: SoundEntry[]) => {
        setEntries(newEntries);
        saveSoundEntries(newEntries);
    };

    const playSound = (soundUrl: string, volume: number, entryId: string) => {
        if (playingId === entryId && audioRef.current?.paused === false) {
            audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = soundUrl;
        audioRef.current.volume = volume;
        audioRef.current.play();
        setPlayingId(entryId);
        audioRef.current.onended = () => setPlayingId(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            Toasts.show({ message: "File size too large! Maximum 10MB", type: Toasts.Type.FAILURE, id: Toasts.genId() });
            return;
        }

        try {
            const base64 = await convertFileToBase64(file);
            setForm(prev => ({ ...prev, soundUrl: base64, filename: file.name }));
        } catch {
            Toasts.show({ message: "Error reading file", type: Toasts.Type.FAILURE, id: Toasts.genId() });
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleEdit = (entry: SoundEntry) => {
        const isUser = entry.type === "user";
        setForm({
            id: entry.userId || entry.guildId,
            name: isUser ? entry.displayName?.trim() || "" : entry.guildName?.trim() || "",
            note: entry.userLabel?.trim() || "",
            soundUrl: entry.soundUrl.trim(),
            filename: entry.filename || "",
            volume: entry.volume,
            displayNameMode: isUser && !!entry.displayName && !entry.userId,
            error: false
        });
        setSliderKey(prev => prev + 1);
        setEditingId(entry.id);
    };

    const handleAddOrUpdate = () => {
        const isUser = currentTab === "users";
        const primaryId = form.displayNameMode ? form.name : form.id;

        if (!primaryId || !form.soundUrl) return;

        const isDuplicate = entries.some(entry => {
            if (editingId === entry.id) return false;
            if (isUser) {
                return form.displayNameMode
                    ? entry.displayName === primaryId && entry.type === "user"
                    : entry.userId === primaryId && entry.type === "user";
            }
            return entry.guildId === primaryId && entry.type === "guild";
        });

        if (isDuplicate) {
            setForm(prev => ({ ...prev, error: true }));
            return;
        }

        const createUserEntry = (): SoundEntry => ({
            id: `user_${Date.now()}`,
            type: "user",
            userId: form.displayNameMode ? "" : form.id.trim(),
            displayName: form.displayNameMode ? form.name.trim() : "",
            userLabel: form.note.trim(),
            guildId: "",
            guildName: "",
            soundUrl: form.soundUrl.trim(),
            filename: form.filename,
            volume: form.volume
        });

        const createGuildEntry = (): SoundEntry => ({
            id: `guild_${Date.now()}`,
            type: "guild",
            userId: "",
            displayName: "",
            userLabel: "",
            guildId: form.id.trim(),
            guildName: form.name.trim(),
            soundUrl: form.soundUrl.trim(),
            filename: form.filename,
            volume: form.volume
        });

        const newEntries = editingId
            ? entries.map(entry => {
                if (entry.id !== editingId) return entry;
                return {
                    ...entry,
                    ...(isUser
                        ? {
                            userId: form.displayNameMode ? "" : form.id.trim(),
                            displayName: form.displayNameMode ? form.name.trim() : "",
                            userLabel: form.note.trim()
                        }
                        : {
                            guildId: form.id.trim(),
                            guildName: form.name.trim()
                        }),
                    soundUrl: form.soundUrl.trim(),
                    filename: form.filename,
                    volume: form.volume
                };
            })
            : [...entries, isUser ? createUserEntry() : createGuildEntry()];

        saveEntries(newEntries);
        resetForm();
    };

    const resetForm = () => {
        setForm({ id: "", name: "", note: "", soundUrl: "", filename: "", volume: 0.5, displayNameMode: false, error: false });
        setSliderKey(prev => prev + 1);
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        saveEntries(entries.filter(entry => entry.id !== id));
    };

    const handleTabChange = (tab: "users" | "guilds") => {
        setCurrentTab(tab);
        resetForm();
    };

    const isUserTab = currentTab === "users";
    const filteredEntries = entries.filter(e => (isUserTab ? e.type === "user" : e.type === "guild"));
    const isValidForm = (isUserTab && form.displayNameMode ? form.name : form.id) && form.soundUrl;

    return (
        <>
            <TabBar type="top" look="brand" selectedItem={currentTab} onItemSelect={handleTabChange} >
                <TabBar.Item id="users">Users ({entries.filter(e => e.type === "user").length})</TabBar.Item>
                <TabBar.Item id="guilds">Servers ({entries.filter(e => e.type === "guild").length})</TabBar.Item>
            </TabBar>

            <div className={cl("tabContainer")}>
                <div className={cl("contentWrapper")}>
                    <div className={cl("formContainer")} style={editingId ? { borderLeft: "3px solid var(--brand-experiment)", paddingLeft: "12px", opacity: 0.95 } : undefined}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <Text variant="heading-md/semibold">
                                {editingId ? `Edit ${isUserTab ? "User" : "Server"} Sound` : `Add ${isUserTab ? "User" : "Server"} Sound`}
                            </Text>
                        </div>

                        <div className={cl("inputGroup")}>
                            <TextInput
                                placeholder={isUserTab ? "User ID (required)" : "Server ID (required)"}
                                value={form.displayNameMode ? form.name : form.id}
                                error={form.error ? `this ${isUserTab ? "user" : "guild"} already exists` : ""}
                                onChange={val => {
                                    const filtered = val.replace(/[^0-9]/g, "");
                                    setForm(prev => form.displayNameMode
                                        ? { ...prev, name: filtered, error: false }
                                        : { ...prev, id: filtered, error: false }
                                    );
                                }}
                            />

                            {isUserTab && (
                                <TextInput
                                    placeholder="Note (optional, for display only)"
                                    value={form.note}
                                    onChange={val => setForm(prev => ({ ...prev, note: val }))}
                                />
                            )}
                        </div>

                        <div className={cl("fileSection")}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                color={Button.Colors.PRIMARY}
                                size={Button.Sizes.SMALL}
                            >
                                Upload Sound
                            </Button>
                            <Text variant="text-xs/normal" className={cl("fileText")}>
                                {form.filename
                                    ? form.filename
                                    : form.soundUrl && !form.soundUrl.startsWith("data:")
                                        ? "URL set"
                                        : "No sound selected"}
                            </Text>
                        </div>

                        <div className={cl("volumeContainer")}>
                            <Text variant="text-sm/normal" className={cl("volumeLabel")}>
                                Volume: {(form.volume * 100).toFixed(0)}%
                            </Text>
                            <Slider
                                key={sliderKey}
                                minValue={0}
                                maxValue={1}
                                keyboardStep={0.05}
                                initialValue={form.volume}
                                asValueChanges={val => setForm(prev => ({ ...prev, volume: val }))}
                            />
                        </div>

                        <div className={cl("buttonGroup")}>
                            <Button
                                onClick={handleAddOrUpdate}
                                color={Button.Colors.BRAND}
                                size={Button.Sizes.SMALL}
                                disabled={!isValidForm}
                            >
                                {editingId ? "Update Notification" : "Add Notification"}
                            </Button>

                            {editingId && (
                                <Button
                                    onClick={resetForm}
                                    color={Button.Colors.PRIMARY}
                                    size={Button.Sizes.SMALL}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>

                    {filteredEntries.length === 0 ? (
                        <Text variant="text-sm/bold" className={cl("emptyState")}>
                            No {isUserTab ? "user" : "server"} sounds configured yet.
                        </Text>
                    ) : (
                        <div className={cl("entryList")}>
                            {filteredEntries.map(entry => (
                                <div key={entry.id} className={cl("entryCard")} style={editingId === entry.id ? { opacity: 0.5 } : undefined}>
                                    <div className={cl("entryInfo")}>
                                        <Text variant="text-md/semibold">
                                            {getEntryDisplay(entry, isUserTab)}
                                        </Text>
                                        <Paragraph color="var(--text-muted)">
                                            {getEntrySubtext(entry, isUserTab)}
                                        </Paragraph>
                                        <Paragraph style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            File: {entry.filename || (entry.soundUrl.startsWith("data:") ? "Uploaded file" : entry.soundUrl.substring(0, 40))}
                                            {!entry.filename && entry.soundUrl.length > 40 && !entry.soundUrl.startsWith("data:") ? "..." : ""}
                                        </Paragraph>
                                        <Paragraph>
                                            Volume: {(entry.volume * 100).toFixed(0)}%
                                        </Paragraph>
                                    </div>

                                    <div className={cl("entryActions")}>
                                        {editingId === entry.id ? (
                                            <Paragraph>
                                                Currently Editing
                                            </Paragraph>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => playSound(entry.soundUrl, entry.volume, entry.id)}
                                                    color={Button.Colors.PRIMARY}
                                                    size={Button.Sizes.SMALL}
                                                >
                                                    {playingId === entry.id ? "⏸ Stop" : "▶ Play"}
                                                </Button>
                                                <Button
                                                    onClick={() => handleEdit(entry)}
                                                    color={Button.Colors.PRIMARY}
                                                    size={Button.Sizes.SMALL}
                                                    icon={() => <PencilIcon viewBox="0 0 24 24" width="20" height="20" />}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(entry.id)}
                                                    color={Button.Colors.RED}
                                                    size={Button.Sizes.SMALL}
                                                    icon={() => <DeleteIcon viewBox="0 0 24 24" width="20" height="20" />}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div >
        </>);
}
