import * as _ from "lodash";
import * as os from "os";

import { DirectoryProcessor } from "./DirectoryProcessor";

let imageInputDir = "";
let imageOutputDir = os.tmpdir();
let filenameFormat = "{year}/{topLabel}/{combinedLabels}--{filename}";

let _showUsage = () => {
    let scriptName = "node " + process.argv[1];
    console.log(
        `USAGE: ${scriptName} <path to input dir> <path to output dir> [file format]`,
        `  where file format is like:`,
        `    {year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename}`
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
 *  - for each such file:
 *      - send lat/long to geolocation service -> locationDescription
 *      - add/update entry in mapFilenameToLocation.csv
 * - use that file mapFilenameToLocation.csv -> create/update mapDateToLocation.csv file
 *
 * - THEN run the image classifcation
 * - when generating new filename:
 *      - first look for entry in mapFilenameToLocation.csv
 *      - else try map image date -> locationDescription from mapDateToLocation.csv file
 */

DirectoryProcessor.processDirectory(imageInputDir, imageOutputDir, filenameFormat)
    .then((isOk: boolean) => {
        if (isOk) {
            console.log("[done]");
        } else {
            console.error("main: [errors occurred]");
        }
    })
    .catch(error => {
        console.error("main: [error occurred]", error);
    });
