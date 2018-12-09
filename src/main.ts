import * as _ from "lodash";

import { DirectoryProcessor } from "./DirectoryProcessor";
import { ArgsParser } from "./utils/args/ArgsParser";

const args = ArgsParser.getArgs();
if (!args) {
    process.exit(666);
}

// TODO xxx - get city/region (country) from *phone* image -> mapDateToLocation.auto.csv
/**
 * - first identify all images that have a lat/long
 *  - for each such file:
 *      [done] - send lat/long to geolocation service -> locationDescription
 * - n/a *create* mapFileNameToLocation.auto.csv file
 * - [ ] *create* mapDateToLocation.auto.csv file
 *
 * - THEN run the image classifcation
 * - when generating new filename:
 *      - first use imageProps.location (done) THEN mapDateToLocation.csv THEN mapDateToLocation.auto.csv
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
