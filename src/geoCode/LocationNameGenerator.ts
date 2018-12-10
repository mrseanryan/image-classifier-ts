import { parse } from "marked";

import { NameGeneratorUtil } from "../utils/NameGeneratorUtil";
import { StringUtils } from "../utils/StringUtils";

export enum LocationFormatToken {
    Country = "country",
    Area1 = "area1",
    Area2 = "area2",
    Area3 = "area3"
}

export type LocationNameTokens = Map<LocationFormatToken, string>;

export namespace LocationNameGenerator {
    export function generate(tokens: LocationNameTokens, format: string): string {
        return NameGeneratorUtil.generateNameFromTokens(tokens, format, "location");
    }
}
