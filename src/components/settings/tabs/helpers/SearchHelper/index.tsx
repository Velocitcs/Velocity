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

import { get, set } from "@api/DataStore";
import { Button } from "@components/Button";
import { CodeBlock } from "@components/CodeBlock";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { HeadingTertiary } from "@components/Heading";
import { DeleteIcon, ErrorIcon, InfoIcon, LogIcon, PlusIcon } from "@components/Icons";
import { Margins } from "@components/margins";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { debounce } from "@shared/debounce";
import { copyWithToast } from "@utils/discord";
import { Logger } from "@utils/Logger";
import { filters, search, wreq } from "@webpack";
import { Forms, ManaSelect, TextInput, useEffect, useState } from "@webpack/common";

enum SearchType {
    CODE,
    PROPS,
    COMPONENT_BY_CODE,
    MODULE_ID
}

type FindErrorType = "MULTIPLE_MODULES" | "NOT_FOUND" | "NO_INPUT";


interface SearchState {
    filters: string[];
    searchType: number;
}

interface SearchResult {
    id: string;
    func: Function;
}

interface FindResult {
    error?: { text: string; type: FindErrorType; };
    module?: [string, Function];
}

const searchTypes = [
    { label: "findByCode", value: SearchType.CODE, id: "code", default: true },
    { label: "findByProps", value: SearchType.PROPS, id: "props" },
    { label: "findComponentByCode", value: SearchType.COMPONENT_BY_CODE, id: "componentByCode" },
    { label: "findModuleId", value: SearchType.MODULE_ID, id: "moduleId" }
];

const STORE_KEY = "SearchHelper";

function buildFilterFns(searchType: SearchType, cleanFilters: string[]): ((mod: any) => boolean)[] {
    const filterFns: ((mod: any) => boolean)[] = [];

    switch (searchType) {
        case SearchType.CODE:
            cleanFilters.forEach(q => filterFns.push(filters.byCode(q)));
            break;
        case SearchType.PROPS:
            cleanFilters.forEach(q => {
                const props = q.split(",").map(p => p.trim()).filter(Boolean);
                if (props.length) filterFns.push(filters.byProps(...props));
            });
            break;
        case SearchType.COMPONENT_BY_CODE:
            cleanFilters.forEach(q => filterFns.push(filters.componentByCode(q)));
            break;
    }

    return filterFns;
}

function findMatches(searchType: SearchType, cleanFilters: string[]): SearchResult[] {
    if (searchType === SearchType.MODULE_ID) {
        const moduleId = cleanFilters[0];
        if (!moduleId) return [];
        const func = wreq.m[moduleId];
        return func != null ? [{ id: moduleId, func }] : [];
    }

    const filterFns = buildFilterFns(searchType, cleanFilters);
    if (!filterFns.length) return [];

    const candidates = search(/.*/);
    const matches: SearchResult[] = [];

    for (const id in candidates) {
        try {
            if (filterFns.every(fn => fn(candidates[id]))) {
                matches.push({ id, func: candidates[id] });
            }
        } catch { }
    }

    return matches;
}

function doSearch(
    filtersInput: string[],
    searchType: SearchType,
    setResult: (r: FindResult) => void
): void {
    const cleanFilters = filtersInput.filter(q => q.trim());

    if (!cleanFilters.length) {
        setResult({});
        return;
    }

    const matches = findMatches(searchType, cleanFilters);

    if (matches.length === 0) {
        setResult({
            error: { text: searchType === SearchType.MODULE_ID ? "Module ID not found" : "No modules found", type: "NOT_FOUND" }
        });
    } else if (matches.length > 1) {
        setResult({
            error: { text: `${matches.length} modules found, be more specific`, type: "MULTIPLE_MODULES" }
        });
    } else {
        setResult({ module: [matches[0].id, matches[0].func] });
    }
}

function SearchHelper() {
    const [filters, setFilters] = useState<string[]>([""]);
    const [searchType, setSearchType] = useState<SearchType>(SearchType.CODE);
    const [result, setResult] = useState<FindResult>({});

    useEffect(() => {
        get(STORE_KEY).then((saved: SearchState | undefined) => {
            if (saved?.filters) {
                setFilters(saved.filters);
                setSearchType(saved.searchType as SearchType);
                doSearch(saved.filters, saved.searchType as SearchType, setResult);
            }
        });
    }, []);

    useEffect(() => {
        set(STORE_KEY, { filters, searchType });
    }, [filters, searchType]);

    const handleSearch = debounce((newFilters: string[], newSearchType: SearchType) => {
        doSearch(newFilters, newSearchType, setResult);
    });

    const handleFilters = (index: number, value: string | null) => {
        let newFilters: string[];

        if (value === null) {
            newFilters = filters.filter((_, i) => i !== index);
        } else {
            newFilters = [...filters];
            newFilters[index] = value;
        }

        setFilters(newFilters);
        handleSearch(newFilters, searchType);
    };

    const printModules = () => {
        const cleanFilters = filters.filter(q => q.trim());
        if (!cleanFilters.length) return;

        const matches = findMatches(searchType, cleanFilters);
        if (matches.length === 0) return;

        new Logger("SearchHelper").log(`Found ${matches.length} module(s):`, matches.map(m => m.func));
    };

    return (
        <SettingsTab title="Search Helper">
            <HeadingTertiary className={Margins.top8}>Search by</HeadingTertiary>
            <ManaSelect
                options={searchTypes}
                value={searchType}
                onChange={(v: SearchType) => {
                    setSearchType(v);
                    doSearch(filters, v, setResult);
                }}
                serialize={v => v}
            />

            <Divider style={{ margin: "20px 0" }} />

            <HeadingTertiary className={Margins.top8}>Filters</HeadingTertiary>

            {filters.map((query, index) => (
                <Flex key={index} style={{ gap: 8, marginBottom: 10 }}>
                    <TextInput
                        type="text"
                        value={query}
                        onChange={v => handleFilters(index, v)}
                        placeholder="Filter"
                    />
                    {index > 0 && (
                        <Button
                            size={Button.Sizes.MIN}
                            onClick={() => handleFilters(index, null)}
                            style={{ background: "none", color: "var(--status-danger)" }}
                        >
                            <DeleteIcon width="24" height="24" viewBox="0 0 24 24" />
                        </Button>
                    )}
                </Flex>
            ))}

            <Flex style={{ gap: 8, marginBottom: 10 }} className={Margins.top8}>
                <Button
                    onClick={() => setFilters([...filters, ""])}
                    icon={() => <PlusIcon width="20" height="20" viewBox="0 0 24 24" />}
                    size={Button.Sizes.SMALL}
                    color={Button.Colors.BRAND}
                >
                    Add Filter
                </Button>

                {filters.some(q => q.trim()) && (result.module || result.error?.type === "MULTIPLE_MODULES") && (
                    <Button
                        size={Button.Sizes.SMALL}
                        color={Button.Colors.GREEN}
                        icon={() => <LogIcon width="20" height="20" viewBox="0 0 24 24" />}
                        onClick={printModules}
                    >
                        {result.module ? "Print" : "Log anyway"}
                    </Button>
                )}
            </Flex>

            {(result.error || result.module) && (
                <>
                    {result.error ? (
                        <ErrorIcon width="18" height="18" viewBox="0 0 24 24" style={{ color: "var(--status-danger)", verticalAlign: "middle", marginRight: 6 }} />
                    ) : (
                        <InfoIcon width="18" height="18" viewBox="0 0 24 24" style={{ color: "var(--icon-feedback-info)", verticalAlign: "middle", marginRight: 6 }} />
                    )}
                    <Forms.FormText
                        style={{
                            color: result.error ? "var(--status-danger)" : "var(--text-feedback-info)",
                            display: "inline"
                        }}
                    >
                        {result.error?.text || "Find: OK"}
                    </Forms.FormText>
                </>
            )}

            {result.module && (
                <>
                    <Divider className={Margins.top16} />
                    <HeadingTertiary className={Margins.top16}>Module {result.module[0]}</HeadingTertiary>
                    <CodeBlock lang="js" content={result.module[1].toString()} />
                    <Flex className={Margins.top8}>
                        <Button onClick={() => copyWithToast(result.module![1].toString())}>
                            Copy Module Code
                        </Button>
                        <Button onClick={() => copyWithToast(result.module![0])}>
                            Copy Module ID
                        </Button>
                    </Flex>
                </>
            )}
        </SettingsTab>
    );
}

export default (IS_DEV ? wrapTab(SearchHelper, "SearchHelper") : null) as any;
