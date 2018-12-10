import { parse } from "marked";

import { NameGeneratorUtil } from "./NameGeneratorUtil";
import { StringUtils } from "./StringUtils";

export enum FileFormatToken {
    Year = "year",
    TopLabel = "topLabel",
    CombinedLabels = "combinedLabels",
    Filename = "filename",
    Location = "location",
    FileSizeMb = "fileSizeMb"
}

export type FileNameTokens = Map<FileFormatToken, string>;

export namespace FilenameGenerator {
    export function generateFilename(tokens: FileNameTokens, format: string): string {
        return NameGeneratorUtil.generateNameFromTokens(tokens, format, "file");
    }

    export function doesFormatIncludeLocation(format: string): boolean {
        return format.indexOf(NameGeneratorUtil.getTokenWithBraces(FileFormatToken.Location)) >= 0;
    }
}
