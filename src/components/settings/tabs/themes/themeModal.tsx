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

import { Divider } from "@components/Divider";
import { DeleteIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { UserThemeHeader } from "@main/themes";
import { ManaModalContent, ManaModalFooter, ManaModalHeader, ManaModalRoot } from "@utils/manaModal";
import { closeModal } from "@utils/modal";
import { Alerts, Forms, Select, showToast, TextInput, Toasts, useEffect, useRef, useState } from "@webpack/common";
import * as monaco from "monaco-editor";

interface ThemeModalProps {
    mode: "create" | "edit";
    onSuccess: () => void;
    modalKey: string;
    transitionState: any;
}

export function ThemeModal({ mode, onSuccess, modalKey, transitionState }: ThemeModalProps) {
    const [fileName, setFileName] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("");
    const [themes, setThemes] = useState<UserThemeHeader[]>([]);
    const editorRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (mode === "edit") {
            VelocityNative.themes.getThemesList().then(setThemes);

            if (selectedTheme) {
                VelocityNative.themes.getThemeData(selectedTheme).then(data => {
                    editorInstanceRef.current?.setValue(data || "");
                });
            }
        }
    }, [selectedTheme, mode]);

    useEffect(() => {
        if (!editorRef.current || editorInstanceRef.current) return;

        window.MonacoEnvironment = {
            getWorker: () => new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent("self.postMessage({});"))
        };

        const editor = monaco.editor.create(editorRef.current, {
            value: "",
            language: "css",
            theme: "vs-dark",
            minimap: { enabled: false },
            automaticLayout: true,
            formatOnPaste: true
        });

        editorInstanceRef.current = editor;

        return () => editorInstanceRef.current?.dispose();
    }, []);

    const handleButton = async () => {
        const code = editorInstanceRef.current?.getValue() || "";
        const name = mode === "edit" ? selectedTheme : (fileName.endsWith(".css") ? fileName : fileName + ".css");

        if (!name.trim() || !code.trim()) {
            showToast(mode === "edit" ? "Select a theme and provide CSS code." : "Enter a file name and some CSS code.", Toasts.Type.FAILURE);
            return;
        }

        if (mode === "create") {
            const existing = await VelocityNative.themes.getThemesList();
            if (existing.find(t => t.fileName.toLowerCase() === name.toLowerCase())) {
                Alerts.show({
                    title: "File Already Exists",
                    body: `A theme named "${name}" already exists.`,
                    confirmText: "OK",
                    confirmColor: "vc-button-danger"
                });
                return;
            }
        }

        try {
            await VelocityNative.themes.uploadTheme(name, code);
            showToast(`Theme "${name}" ${mode === "edit" ? "updated" : "created"}!`, Toasts.Type.SUCCESS);
            onSuccess();
            closeModal(modalKey);
        } catch (err) {
            console.error("[Velocity] Failed to save theme:", err);
            showToast("Failed to save theme.", Toasts.Type.FAILURE);
        }
    };

    return (
        <ManaModalRoot transitionState={transitionState} onClose={() => closeModal(modalKey)} size="md">
            <ManaModalHeader title={mode === "edit" ? "Edit Theme" : "Create New Theme"} />
            <ManaModalContent>
                {mode === "edit" ? (
                    <div style={{ marginBottom: "16px" }}>
                        <Forms.FormTitle tag="h5">Select Theme</Forms.FormTitle>
                        <Select
                            options={themes.map(theme => ({ label: theme.fileName, value: theme.fileName }))}
                            isSelected={v => v === selectedTheme}
                            select={setSelectedTheme}
                            serialize={v => v}
                        />
                    </div>
                ) : (
                    <div style={{ marginBottom: "16px" }}>
                        <Forms.FormTitle tag="h5">Theme Name</Forms.FormTitle>
                        <TextInput placeholder="File name" onChange={setFileName} />
                    </div>
                )}

                <Divider className={Margins.bottom16} />

                <div style={{ height: "400px", overflow: "hidden" }}>
                    <div ref={editorRef} style={{ width: "100%", height: "100%" }} />
                </div>
            </ManaModalContent>
            <ManaModalFooter
                actions={[
                    {
                        text: "Cancel",
                        variant: "primary",
                        icon: () => <DeleteIcon viewBox="0 0 24 24" height="20" width="20" />,
                        onClick: () => closeModal(modalKey)
                    },
                    {
                        text: mode === "edit" ? "Save Theme" : "Create Theme",
                        onClick: handleButton,
                    }
                ]}
            />
        </ManaModalRoot>
    );
}
