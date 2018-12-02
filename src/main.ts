// TODO xxx refactor this file!
import * as _ from "lodash";
import * as os from "os";

import { ImageClassifier } from "./ImageClassifier";

let imageInputDir = "";
let imageOutputDir = os.tmpdir();
let filenameFormat = "{year}/{topLabel}/{combinedLabels}--{filename}";

let _showUsage = () => {
    let scriptName = "node " + process.argv[1];
    console.log(
        `USAGE: ${scriptName} <path to input dir> <path to output dir> [file format]`,
        `  where file format is like:`,
        `    {year}/{topLabel}/{combinedLabels}--{filename}`
    );
};

let _processArgs = () => {
    switch (process.argv.length) {
        case 4:
            imageInputDir = process.argv[2];
            imageOutputDir = process.argv[3];
            break;
        case 5:
            imageInputDir = process.argv[2];
            imageOutputDir = process.argv[3];
            filenameFormat = process.argv[4];
            break;
        default:
            _showUsage();
            process.exit(666);
    }
};
_processArgs();

// TODO xxx - get city/region (country) from *phone* image -> mapDateToLocation.csv
/**
 * - first identify all images that have a lat/long
 * - take 1 such image for each date
 * - for each image, send lat/long to geolocation service -> locationDescription
 * - gen a CSV file (easy to manually edit/create): like `mapDateToLocation.csv`
 * - THEN run the image classifcation
 * - when generating new filename, try map image date -> locationDescription from the CSV file
 */

const isOk = ImageClassifier.classifyAndMoveImages(imageInputDir, imageOutputDir, filenameFormat);

if (isOk) {
    console.log("[done]");
} else {
    console.error("[errors occurred]");
}
