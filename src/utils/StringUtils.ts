export namespace StringUtils {
    export function replaceAll(text: string, token: string, replacement: string): string {
        return text.split(token).join(replacement);
    }
}
