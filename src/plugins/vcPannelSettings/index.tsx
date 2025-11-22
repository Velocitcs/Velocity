/*
 * Velocity, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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

import "./styles.css";

import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import { identity } from "@utils/misc";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Forms, MediaEngineStore, Select, Slider, useEffect, useState } from "@webpack/common";

import { settings } from "./settings";

const VoiceActions = findByPropsLazy("setOutputVolume", "setInputVolume", "setOutputDevice", "setInputDevice", "setVideoDevice");

function OutputVolumeComponent() {
    const [outputVolume, setOutputVolume] = useState(MediaEngineStore.getOutputVolume());

    useEffect(() => {
        const update = () => setOutputVolume(MediaEngineStore.getOutputVolume());
        MediaEngineStore.addChangeListener(update);
        return () => MediaEngineStore.removeChangeListener(update);
    }, []);

    return (
        <>
            <Forms.FormTitle>Output volume</Forms.FormTitle>
            <Slider
                maxValue={200}
                minValue={0}
                initialValue={outputVolume}
                onValueChange={v => {
                    VoiceActions.setOutputVolume(v);
                }}
            />
        </>
    );
}

function InputVolumeComponent() {
    const [inputVolume, setInputVolume] = useState(MediaEngineStore.getInputVolume());

    useEffect(() => {
        const update = () => setInputVolume(MediaEngineStore.getInputVolume());
        MediaEngineStore.addChangeListener(update);
        return () => MediaEngineStore.removeChangeListener(update);
    }, []);

    return (
        <>
            <Forms.FormTitle>Input volume</Forms.FormTitle>
            <Slider
                maxValue={100}
                minValue={0}
                initialValue={inputVolume}

                onValueChange={v => {
                    VoiceActions.setInputVolume(v);
                }}
            />
        </>
    );
}

function OutputDeviceComponent() {
    const [outputDevice, setOutputDevice] = useState(MediaEngineStore.getOutputDeviceId());

    useEffect(() => {
        const update = () => setOutputDevice(MediaEngineStore.getOutputDeviceId());
        MediaEngineStore.addChangeListener(update);
        return () => MediaEngineStore.removeChangeListener(update);
    }, []);

    const devices = Object.values(MediaEngineStore.getOutputDevices()) as any[];

    return (
        <>
            <Forms.FormTitle>Output device</Forms.FormTitle>
            <Select
                options={devices.map((d: any) => ({
                    value: d.id,
                    label: d.name
                }))}
                serialize={identity}
                isSelected={v => v === outputDevice}
                select={id => {
                    VoiceActions.setOutputDevice(id);
                }}
            />
        </>
    );
}

function InputDeviceComponent() {
    const [inputDevice, setInputDevice] = useState(MediaEngineStore.getInputDeviceId());

    useEffect(() => {
        const update = () => setInputDevice(MediaEngineStore.getInputDeviceId());
        MediaEngineStore.addChangeListener(update);
        return () => MediaEngineStore.removeChangeListener(update);
    }, []);

    const devices = Object.values(MediaEngineStore.getInputDevices()) as any[];

    return (
        <div style={{ marginTop: "10px" }}>
            <Forms.FormTitle>Input device</Forms.FormTitle>
            <Select
                options={devices.map((d: any) => ({
                    value: d.id,
                    label: d.name
                }))}
                serialize={identity}
                isSelected={v => v === inputDevice}
                select={id => {
                    VoiceActions.setInputDevice(id);
                }}
            />
        </div>
    );
}

function VideoDeviceComponent() {
    const [videoDevice, setVideoDevice] = useState(MediaEngineStore.getVideoDeviceId());

    useEffect(() => {
        const update = () => setVideoDevice(MediaEngineStore.getVideoDeviceId());
        MediaEngineStore.addChangeListener(update);
        return () => MediaEngineStore.removeChangeListener(update);
    }, []);

    const devices = Object.values(MediaEngineStore.getVideoDevices()) as any[];
    const noCamera = devices.length === 0 || devices.every((d: any) => !d.name);

    return (
        <div style={{ marginTop: "10px" }}>
            <Forms.FormTitle>Camera</Forms.FormTitle>
            <Select
                options={devices.map((device: any) => {
                    const name = device.name || "No camera available";
                    return { value: device.id, label: name };
                })}
                serialize={identity}
                isDisabled={noCamera}
                isSelected={value => value === videoDevice}
                select={id => {
                    VoiceActions.setVideoDevice(id);
                }}
            />
        </div>
    );
}

function VoiceSettings() {
    const [showSettings, setShowSettings] = useState(settings.store.saveDropdownState);

    return (
        <div style={{ marginTop: "5px" }}>
            <div style={{ marginBottom: "5px" }}>
                <Link
                    className="vc-panelsettings-underline-on-hover"
                    style={{ color: "var(--header-secondary)" }}
                    onClick={() => {
                        const next = !showSettings;
                        settings.store.saveDropdownState = next;
                        setShowSettings(next);
                    }}
                >
                    {!showSettings ? "► Settings" : "▼ Hide"}
                </Link>
            </div>

            {showSettings && (
                <>
                    <OutputVolumeComponent />
                    <InputVolumeComponent />
                    <OutputDeviceComponent />
                    <InputDeviceComponent />
                    <VideoDeviceComponent />
                </>
            )}
        </div>
    );
}

export default definePlugin({
    name: "VcPanelSettings",
    description: "Control voice settings inside the voice panel",
    authors: [Devs.Velocity],
    settings,

    renderVoiceSettings() {
        return <VoiceSettings />;
    },

    patches: [
        {
            find: "this.renderChannelButtons()",
            replacement: {
                match: /this.renderChannelButtons\(\)/,
                replace: "this.renderChannelButtons(), $self.renderVoiceSettings()"
            }
        }
    ]
});
