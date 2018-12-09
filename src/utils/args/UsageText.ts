export namespace UsageText {
    const NEW_LINE = "\n";
    const NEXT_COLUMN = "\t";

    export function showUsage() {
        let scriptName = "node " + process.argv[1];
        console.error(
            [
                `USAGE: ${scriptName} <path to input dir> <path to output dir> [options]`,
                `  where options can be:`,
                `  -filenameFormat=<format>`,
                `    example: -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename}`,
                `  -help OR -h${NEXT_COLUMN}(show this usage text)`,
                `  -minScore${NEXT_COLUMN}(Include only Google labels that have a score at least this high (0-1))`,
                `  -dryRun${NEXT_COLUMN}(Perform a 'dry run' without actually moving any files).`,
                `  -locate${NEXT_COLUMN}(Try to identify the geographical location of the image).`,
                `  -topNLabels${NEXT_COLUMN}(Include the top N labels from Google.)`
            ].join(NEW_LINE)
        );
    }
}