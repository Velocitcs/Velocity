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

import { Text } from "@components/BaseText";
import { Button } from "@components/Button";
import { Flex } from "@components/Flex";
import { UserThemeHeader } from "@main/themes";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize } from "@utils/modal";
import { Alerts, Forms, Select, showToast, TextInput, Toasts, useEffect, useRef, useState } from "@webpack/common";
import * as monaco from "monaco-editor";

import { ThemeReturnState } from "./LocalThemesTab";

interface ThemeModalProps {
    mode: "create" | "edit";
    modalProps: ModalProps;
    returnState: (state: ThemeReturnState) => void;
}

export function ThemeModal({ mode, modalProps, returnState }: ThemeModalProps) {
    const [fileName, setFileName] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("");
    const [themes, setThemes] = useState<UserThemeHeader[]>([]);
    const [code, setCode] = useState("");
    const editorRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        if (editorInstanceRef.current) {
            editorInstanceRef.current.dispose();
            editorInstanceRef.current = null;
        }

        window.MonacoEnvironment = { getWorker: () => new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent("self.postMessage({});")) };
        const editor = monaco.editor.create(editorRef.current, {
            value: "",
            language: "css",
            theme: "vs-dark",
            minimap: { enabled: false },
            automaticLayout: true,
            formatOnPaste: true,
            contextmenu: false,
        });

        editor.onDidChangeModelContent(() => { setCode(editor.getValue()); });
        editorInstanceRef.current = editor;

        if (mode === "edit") {
            VelocityNative.themes.getThemesList().then(setThemes);
        }

        return () => editorInstanceRef.current?.dispose();
    }, [mode]);

    useEffect(() => {
        if (selectedTheme && editorInstanceRef.current) {
            VelocityNative.themes.getThemeData(selectedTheme).then(data => {
                editorInstanceRef.current?.setValue(data || "");
                setCode(data || "");
            });
        }
    }, [selectedTheme]);

    const handleButton = async () => {
        const code = editorInstanceRef.current?.getValue() || "";
        const name = mode === "edit" ? selectedTheme : (fileName.endsWith(".css") ? fileName : fileName + ".css");

        if (mode === "create") {
            const existing = await VelocityNative.themes.getThemesList();
            if (existing.find(t => t.fileName.toLowerCase() === name.toLowerCase())) {
                Alerts.show({
                    title: "File Already Exists",
                    body: `A theme named "${name}" already exists.`,
                    confirmText: "OK",
                });
                returnState(ThemeReturnState.ALREADY_EXIST);
                return;
            }
        }

        try {
            await VelocityNative.themes.uploadTheme(name, code);
            showToast(`Theme "${name}" ${mode === "edit" ? "updated" : "created"}!`, Toasts.Type.SUCCESS);
            returnState(ThemeReturnState.SUCCESS);
            modalProps.onClose();
        } catch (err) {
            showToast("Failed to save theme.", Toasts.Type.FAILURE);
            returnState(ThemeReturnState.ERROR);
        }
    };

    return (
        <ModalRoot {...modalProps} size={ModalSize.MEDIUM}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flex: 1 }}>{mode === "edit" ? "Edit Theme" : "Create New Theme"}</Text>
                <ModalCloseButton onClick={modalProps.onClose} />
            </ModalHeader>
            <ModalContent>
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
                        <TextInput placeholder="File name" value={fileName} onChange={setFileName} />
                    </div>
                )}

                <div style={{ height: "400px", overflow: "hidden" }}>
                    <div ref={editorRef} style={{ width: "100%", height: "100%" }} />
                </div>
            </ModalContent>
            <ModalFooter>
                <Flex style={{ gap: "15px" }}>
                    <Button
                        onClick={modalProps.onClose}
                        color={Button.Colors.PRIMARY}
                        size={Button.Sizes.MEDIUM}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleButton}
                        color={Button.Colors.BRAND}
                        size={Button.Sizes.MEDIUM}
                        disabled={mode === "create" ? !fileName.trim() || !code.trim() : !selectedTheme.trim() || !code.trim()}
                    >
                        {mode === "edit" ? "Update" : "Create"}
                    </Button>
                </Flex>
            </ModalFooter>
        </ModalRoot >
    );
}
