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

import "./styles.css";

import { classNameFactory } from "@api/Styles";
import { Button } from "@components/Button";
import { Divider } from "@components/Divider";
import ErrorBoundary from "@components/ErrorBoundary";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { CogWheel, ErrorIcon } from "@components/Icons";
import { Logger } from "@utils/Logger";
import { findByCodeLazy } from "@webpack";
import { CalendarPicker, ColorPicker, Forms, RadioGroup, SearchableSelect, SearchBar, Select, Slider, TagGroup, TextInput, Tooltip, useState } from "@webpack/common";
import { Moment } from "moment";
import { ReactNode } from "react";

const logger = new Logger("ComponentsTab", "#ffae00ff");
const cl = classNameFactory("vc-components-");

const BotTag = findByCodeLazy(".botTagRegular");

interface SectionProps {
    title: string;
    description: string;
    children: ReactNode;
}

function Section({ title, description, children }: SectionProps) {
    return (
        <ErrorBoundary message={`${title} section failed to render`}>
            <div className={cl("card", "full-width")}>
                <div className={cl("card-header")}>
                    <h5>{title}</h5>
                </div>
                <div className={cl("card-body")}>
                    <Forms.FormText>{description}</Forms.FormText>
                    {children}
                </div>
            </div>
        </ErrorBoundary>
    );
}

function GridSection({ title, description, children }: SectionProps) {
    return (
        <ErrorBoundary message={`${title} section failed to render`}>
            <div className={cl("card")}>
                <div className={cl("card-header")}>
                    <h5>{title}</h5>
                </div>
                <div className={cl("card-body")}>
                    <Forms.FormText>{description}</Forms.FormText>
                    {children}
                </div>
            </div>
        </ErrorBoundary>
    );
}

export function ComponentsTab() {
    const [state, setState] = useState({
        pickerDate: undefined as Moment | undefined,
        showPicker: false,
        color: 0xff9434,
        selectedValue: "option1",
        selectValue: "opt1",
        sliderValue: 50,
        checkboxBasic: false,
        checkboxDisabled: false,
        search: "",
        selectableValue: { label: "Apple", value: "apple" },
        inputs: {
            basic: "",
            leading: "",
            maxLength: "",
            clearable: "Test clearable",
            readOnly: "",
            fullWidth: "",
            tag: ""
        },
        tags: [
            { id: "bot", label: "Bot" },
            { id: "webhooks", label: "Webhooks" }
        ]
    });

    const updateInput = (key: string, value: string) => {
        setState(prev => ({
            ...prev,
            inputs: { ...prev.inputs, [key]: value }
        }));
    };

    const updateState = (key: string, value: any) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!state.inputs.tag.trim()) return;

            const newTag = { id: Date.now().toString(), label: state.inputs.tag.trim() };
            logger.log("[TagGroup] Added tag", { tag: newTag, totalTags: state.tags.length + 1 });

            setState(prev => ({
                ...prev,
                tags: [...prev.tags, newTag],
                inputs: { ...prev.inputs, tag: "" }
            }));
        }
    };

    const removeTag = (keys: Set<string>) => {
        const keyArray = Array.from(keys);
        logger.log("[TagGroup] Removed tags", { removedIds: keyArray, totalTags: state.tags.length - keyArray.length });

        setState(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => !keyArray.includes(tag.id))
        }));
    };

    const handleCalendarSelect = (date: Moment) => {
        logger.log("[CalendarPicker] Date selected", { date: date.format("YYYY-MM-DD") });
        updateState("pickerDate", date);
        updateState("showPicker", false);
    };

    const handleColorChange = (value: number | null) => {
        const hexColor = value ? `#${value.toString(16).padStart(6, "0")}` : "none";
        logger.log("[ColorPicker] Color changed", { hexColor, rawValue: value });
        updateState("color", value);
    };

    const handleRadioChange = (option: { value: any; name?: string | ReactNode; desc?: string; }) => {
        logger.log("[RadioGroup] Selection changed", { value: option.value, name: option.name });
        updateState("selectedValue", option.value);
    };


    return (
        <div className={cl("tab")}>
            <div className={cl("search-box")}>
                <SearchBar
                    autoFocus={true}
                    placeholder="Search sections..."
                    query={state.search}
                    onClear={() => updateState("search", "")}
                    onChange={val => updateState("search", val)}
                />
            </div>
            <div className={cl("grid")}>
                <GridSection title="Calendar Picker" description="Select dates from a calendar interface">
                    <Flex flexDirection="row" style={{ alignItems: "center", gap: 12 }}>
                        <Button
                            onClick={() => updateState("showPicker", !state.showPicker)}
                            size="medium"
                            color="success"
                        >
                            {state.showPicker ? "Hide" : "Show"} Calendar
                        </Button>
                        {state.pickerDate && (
                            <Forms.FormText>
                                Selected: {state.pickerDate.format("YYYY-MM-DD")}
                            </Forms.FormText>
                        )}
                    </Flex>

                    {state.showPicker && (
                        <div className={cl("picker-container")}>
                            <CalendarPicker
                                autoFocus={true}
                                value={state.pickerDate}
                                onSelect={handleCalendarSelect}
                            />
                        </div>
                    )}
                </GridSection>

                <GridSection title="Color Picker" description="Pick colors with eye dropper and palette">
                    <Flex flexDirection="row" style={{ alignItems: "center", gap: 16 }}>
                        <ColorPicker
                            color={state.color}
                            showEyeDropper
                            onChange={handleColorChange}
                        />
                        <Forms.FormText
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: state.color
                                    ? `#${state.color.toString(16).padStart(6, "0")}`
                                    : "var(--text-normal)"
                            }}
                        >
                            {state.color ? `#${state.color.toString(16).padStart(6, "0")}` : "Select color"}
                        </Forms.FormText>
                    </Flex>
                </GridSection>
            </div>

            <Section title="Text Input" description="Various text input configurations and states">
                <div className={cl("inputs-stack")}>
                    <TextInput
                        placeholder="Standard input"
                        value={state.inputs.basic}
                        onChange={val => updateInput("basic", val)}
                    />

                    <TextInput
                        placeholder="Input with prefix"
                        leading="https://"
                        value={state.inputs.leading}
                        onChange={val => updateInput("leading", val)}
                    />

                    <TextInput
                        placeholder="Limited to 50 characters"
                        value={state.inputs.maxLength}
                        onChange={val => updateInput("maxLength", val)}
                        maxLength={50}
                        showCharacterCount={true}
                    />
                    <TextInput
                        placeholder="Can be cleared"
                        value={state.inputs.clearable}
                        onChange={val => updateInput("clearable", val)}
                        onClear={() => updateInput("clearable", "")}
                        clearable={true}
                    />

                    <TextInput
                        placeholder="Read-only input"
                        value="Cannot be edited"
                        readOnly={true}
                    />

                    <TextInput
                        placeholder="Full width input"
                        value={state.inputs.fullWidth}
                        onChange={val => updateInput("fullWidth", val)}
                        fullWidth={true}
                    />

                    <TextInput
                        placeholder="Input with error"
                        error="This field is required"
                        value={state.inputs.readOnly}
                        onChange={val => updateInput("readOnly", val)}
                    />
                </div>
            </Section>

            <Section title="Form Switch" description="Toggle switches with titles and descriptions">
                <div className={cl("inputs-stack")}>
                    <FormSwitch
                        title="Enable feature"
                        description="Turn this feature on or off"
                        value={state.checkboxBasic}
                        onChange={val => {
                            logger.log("[FormSwitch] Toggled", { value: val });
                            updateState("checkboxBasic", val);
                        }}
                    />
                    <FormSwitch
                        title="Disabled switch"
                        description="This switch cannot be toggled"
                        value={state.checkboxDisabled}
                        onChange={val => updateState("checkboxDisabled", val)}
                        disabled={true}
                    />
                </div>
            </Section>

            <Section title="Select" description="Dropdown selection from predefined options">
                <Flex flexDirection="row" style={{ gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                        <Select
                            placeholder="Choose an option..."
                            options={[
                                { label: "Option 1", value: "opt1" },
                                { label: "Option 2", value: "opt2" },
                                { label: "Disabled Option", value: "opt3", disabled: true }
                            ]}
                            isSelected={val => val === state.selectValue}
                            select={val => {
                                logger.log("[Select] Selected", { value: val });
                                updateState("selectValue", val);
                            }}
                            serialize={val => val}
                            renderOptionLabel={opt => (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span>✓</span>
                                    <span>{opt.label}</span>
                                </div>
                            )}
                        />
                    </div>
                    <Button
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.BRAND}
                        onClick={() => {
                            logger.log("[Select] Props", {
                                placeholder: "Choose an option...",
                                options: [
                                    { label: "Option 1", value: "opt1" },
                                    { label: "Option 2", value: "opt2" },
                                    { label: "Disabled Option", value: "opt3", disabled: true }
                                ],
                                isSelected: "val => val === state.selectValue",
                                select: "callback",
                                serialize: "val => val",
                                renderOptionLabel: "function"
                            });
                        }}
                    >
                        Show Props
                    </Button>
                </Flex>
            </Section>

            <Section title="Searchable Select" description="Dropdown with search and filtering">
                <Flex flexDirection="row" style={{ gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                        <SearchableSelect
                            placeholder="Search and select..."
                            options={[
                                { label: "Apple", value: "apple" },
                                { label: "Banana", value: "banana" },
                                { label: "Cherry", value: "cherry" },
                                { label: "Date", value: "date" },
                                { label: "Elderberry", value: "elderberry" },
                                { label: "Fig", value: "fig" }
                            ]}
                            value={state.selectableValue}
                            onChange={val => {
                                logger.log("[SearchableSelect] Changed", { value: val });
                                updateState("selectableValue", val);
                            }}
                            renderOptionPrefix={() => (
                                <span style={{ color: "#a78bfa" }}>🔥</span>
                            )}
                            renderOptionSuffix={opt => opt ? (
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    {opt.value.toUpperCase()}
                                </span>
                            ) : null}
                            clearable={true}
                        />
                    </div>
                    <Button
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.BRAND}
                        onClick={() => {
                            logger.log("[SearchableSelect] Props", {
                                placeholder: "Search and select...",
                                options: [
                                    { label: "Apple", value: "apple" },
                                    { label: "Banana", value: "banana" },
                                    { label: "Cherry", value: "cherry" },
                                    { label: "Date", value: "date" },
                                    { label: "Elderberry", value: "elderberry" },
                                    { label: "Fig", value: "fig" }
                                ],
                                value: "state.selectableValue",
                                onChange: "callback",
                                renderOptionPrefix: "function",
                                renderOptionSuffix: "function",
                                multi: false,
                                clearable: true,
                                closeOnSelect: true
                            });
                        }}
                    >
                        Show Props
                    </Button>
                </Flex>
            </Section>
            <Section title="Slider" description="Numeric input with draggable slider">
                {(() => {
                    const sliderProps = {
                        initialValue: 50,
                        minValue: 0,
                        maxValue: 100,
                        onValueChange: "callback"
                    };

                    const markerSliderProps = {
                        initialValue: 25,
                        minValue: 0,
                        maxValue: 100,
                        markers: [0, 25, 50, 75, 100],
                        stickToMarkers: true,
                        onValueChange: "callback"
                    };

                    return (
                        <>
                            <div className={cl("slider-wrapper")}>
                                <Slider
                                    {...sliderProps}
                                    onValueChange={val => {
                                        logger.log("[Slider] Value changed", { value: val });
                                        updateState("sliderValue", val);
                                    }}
                                />
                                <Button
                                    size={Button.Sizes.SMALL}
                                    color={Button.Colors.BRAND}
                                    onClick={() => {
                                        logger.log("[Slider] Props", sliderProps);
                                    }}
                                >
                                    Show Props
                                </Button>
                            </div>

                            <div className={cl("slider-wrapper")}>
                                <Slider
                                    {...markerSliderProps}
                                    onValueChange={val => {
                                        logger.log("[Slider] Marker slider changed", { value: val });
                                    }}
                                />
                                <Button
                                    size={Button.Sizes.SMALL}
                                    color={Button.Colors.BRAND}
                                    onClick={() => {
                                        logger.log("[Slider] Marker Slider Props", markerSliderProps);
                                    }}
                                >
                                    Show Props
                                </Button>
                            </div>
                        </>
                    );
                })()}
            </Section>

            <Section title="Tag Input" description="Add, remove, and manage tags">
                <TextInput
                    placeholder="Type tag name..."
                    value={state.inputs.tag}
                    onChange={val => updateInput("tag", val)}
                    onKeyDown={addTag}
                />

                <div className={cl("tags-container")}>
                    <TagGroup
                        label="Tags"
                        layout="inline"
                        selectionMode="multiple"
                        items={state.tags}
                        onRemove={removeTag}
                    />
                </div>
            </Section>

            <Section title="Bot Tags" description="Special badges for bots and user types">
                <Flex flexDirection="row" style={{ gap: 12, flexWrap: "wrap" }}>
                    {Object.entries(BotTag.Types).map(([key, type]) => (
                        <BotTag key={key} type={type} />
                    ))}
                </Flex>
            </Section>

            <Section title="Tooltip Positions" description="Tooltips positioned in different directions">
                <Flex flexDirection="row" style={{ gap: 12, flexWrap: "wrap" }}>
                    {(["top", "bottom", "left", "right"] as const).map(position => (
                        <Tooltip
                            key={position}
                            text={`Positioned ${position}`}
                            position={position}
                            color="primary"
                        >
                            {({ onMouseEnter, onMouseLeave }) => (
                                <Button
                                    size={Button.Sizes.SMALL}
                                    color={Button.Colors.BRAND}
                                    onMouseEnter={() => {
                                        logger.log("[Tooltip] Position prop", { position });
                                        onMouseEnter();
                                    }}
                                    onMouseLeave={onMouseLeave}
                                >
                                    {position.toUpperCase()}
                                </Button>
                            )}
                        </Tooltip>
                    ))}
                </Flex>

                <Divider />

                <Flex flexDirection="row" style={{ gap: 12, flexWrap: "wrap" }}>
                    {["primary", "brand", "green", "red", "yellow"].map(color => (
                        <Tooltip
                            key={color}
                            text={`${color} tooltip`}
                            position="top"
                            color={color}
                        >
                            {({ onMouseEnter, onMouseLeave }) => (
                                <Button
                                    size={Button.Sizes.SMALL}
                                    color={Button.Colors.BRAND}
                                    onMouseEnter={() => {
                                        logger.log("[Tooltip] Color prop", { color });
                                        onMouseEnter();
                                    }}
                                    onMouseLeave={onMouseLeave}
                                >
                                    {color.toUpperCase()}
                                </Button>
                            )}
                        </Tooltip>
                    ))}
                </Flex>
            </Section>

            <Section title="Button Colors" description="All available button color variants">
                <Flex flexDirection="row" style={{ gap: 12, flexWrap: "wrap" }}>
                    {Object.entries(Button.Colors).map(([key, btnColor]) => (
                        <Button
                            key={key}
                            color={btnColor}
                            size="medium"
                            onClick={() => logger.log("[Button] Clicked", { color: key, value: btnColor })}
                        >
                            {key}
                        </Button>
                    ))}
                </Flex>
            </Section>

            <Section title="Radio Groups" description="Single selection from multiple radio options">
                <RadioGroup.Gu
                    value={state.selectedValue}
                    options={[
                        { name: "With Color. Randomized because its cool", value: "option1", color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}` },
                        { name: "With Description", value: "option2", desc: "Supporting text" },
                        { name: "Disabled Option", value: "option3", disabled: true },
                        {
                            name: (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span>Custom HTML</span>
                                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
                                        <span>With icon</span>
                                        <CogWheel height="24" width="24" viewBox="0 0 24 24" className="vc-icon" />
                                    </div>
                                </div>
                            ),
                            value: "option4"
                        },
                        { name: "Color + Description", value: "option5", color: "#34ff94", desc: "Both props combined" },
                        { name: "With Icon", value: "option6", icon: (props: any) => <ErrorIcon {...props} height={24} width={24} viewBox="0 0 24 24" /> },
                        { name: "Icon Class", desc: "Custom class styling", value: "option7", radioItemIconClassName: "radioBar__88a69" },
                        { name: "Bar Class", value: "option8", radioBarClassName: "option_be1a1e" }
                    ]}
                    onChange={handleRadioChange}
                />
            </Section>
        </div>
    );
}
