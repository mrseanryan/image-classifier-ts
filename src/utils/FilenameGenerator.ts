import { parse } from "marked";

import { ArrayUtils } from "./ArrayUtils";

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
        validateFormat(format);

        let newFileName = format;

        tokens.forEach((value, token) => {
            newFileName = ArrayUtils.replaceAll(newFileName, getTokenWithBraces(token), value);
        });

        if (hasTokenMarkers(newFileName)) {
            throw new Error(
                `New filename is invalid - '${newFileName}'. is the file name format invalid? - '${format}'`
            );
        }

        return newFileName;
    }

    function getTokenWithBraces(token: string): string {
        return `{${token}}`;
    }

    function validateFormat(format: string) {
        if (!hasTokenMarkers(format)) {
            throw new Error("Invalid file name format");
        }
    }

    function hasTokenMarkers(format: string): boolean {
        return format.indexOf("{") > -1 || format.indexOf("}") > -1;
    }

    export function doesFormatIncludeLocation(format: string): boolean {
        return format.indexOf(getTokenWithBraces(FileFormatToken.Location)) >= 0;
    }
}
