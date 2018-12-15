import { parse } from "marked";

import { NameGeneratorUtil } from "./NameGeneratorUtil";
import { StringUtils } from "./StringUtils";

export enum FileFormatToken {
    CombinedLabels = "combinedLabels",
    Filename = "filename",
    FileSizeMb = "fileSizeMb",
    Height = "height",
    Location = "location",
    TopLabel = "topLabel",
    Width = "width",
    Year = "year"
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
