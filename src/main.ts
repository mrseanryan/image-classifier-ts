import * as _ from "lodash";

import { DirectoryProcessor } from "./DirectoryProcessor";
import { ArgsParser } from "./utils/args/ArgsParser";

const args = ArgsParser.getArgs();
if (!args) {
    process.exit(666);
}

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

DirectoryProcessor.processDirectory(args!)
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
