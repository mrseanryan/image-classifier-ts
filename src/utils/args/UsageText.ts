export namespace UsageText {
    const NEW_LINE = "\n";
    const NEXT_COLUMN = "\t";

    export function showUsage() {
        let scriptName = `node ${process.argv[1]}`;
        console.error(
            [
                `image-classifier-ts`,
                `USAGE: ${scriptName} <path to input dir> <path to output dir> [options]`,
                `  where options can be:`,
                `  -derivedLocationFormat=<format>${NEXT_COLUMN}(The format of the 'location' part of the filename for images with a location derived by date)`,
                `    example: -derivedLocationFormat={country}_{area1}_{area2}_{area3}`,
                `  -dryRun${NEXT_COLUMN}(Perform a 'dry run' without actually moving any files).`,
                `  -filenameFormat=<format>`,
                `    example: -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename}`,
                `  -geoCode${NEXT_COLUMN}(Try to identify the address (geographical location) of the image).`,
                `  -help OR -h${NEXT_COLUMN}(show this usage text)`,
                `  -locationFormat=<format>${NEXT_COLUMN}(The format of the 'location' part of the filename)`,
                `    example: -locationFormat={country}_{area1}_{area2}_{area3}`,
                `  -minScore=<number 0-1>${NEXT_COLUMN}(Include only Google labels that have a score at least this high (0-1))`,
                `  -replaceOnMove${NEXT_COLUMN}(Allow files to be overwritten when moving an image)`,
                `  -topNLabels=<number>${NEXT_COLUMN}(Include the top N labels from Google.)`,
                `  -verbosity=<number 1-3>${NEXT_COLUMN}(Verbosity of output, for debugging).`
            ].join(NEW_LINE)
        );
    }
}
