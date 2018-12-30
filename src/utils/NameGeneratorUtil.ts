import { StringUtils } from "./StringUtils";

export namespace NameGeneratorUtil {
    export function generateNameFromTokens(
        mapTokenToValue: Map<string, string>,
        format: string,
        description: string
    ): string {
        validateFormat(format, description);

        let newName = format;

        mapTokenToValue.forEach((value, token) => {
            newName = StringUtils.replaceAll(newName, getTokenWithBraces(token), value);
        });

        if (hasTokenMarkers(newName)) {
            throw new Error(
                `New ${description} name is invalid - '${newName}'. Is the ${description} name format invalid? - '${format}'`
            );
        }

        return newName;
    }

    export function getTokenWithBraces(token: string): string {
        return `{${token}}`;
    }

    function validateFormat(format: string, description: string) {
        if (!hasTokenMarkers(format)) {
            throw new Error(`Invalid ${description} name format: '${format}'`);
        }
    }

    function hasTokenMarkers(format: string): boolean {
        return format.indexOf("{") > -1 || format.indexOf("}") > -1;
    }
}
