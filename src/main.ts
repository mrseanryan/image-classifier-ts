import * as _ from "lodash";

import { DirectoryProcessor } from "./DirectoryProcessor";
import { ArgsParser } from "./utils/args/ArgsParser";

const args = ArgsParser.getArgs();
if (!args) {
    process.exit(666);
}

/** 2-phase process
 *
 * - first identify all images that have a lat/long
 *  - for each such file:
 *    - send lat/long to geocoding service -> locationDescription
 * - *create* mapDateToLocation.auto.csv file
 *
 * - THEN run the image classifcation
 * - when generating new filename:
 *      - first use imageProps.location THEN mapDateToLocation.csv THEN mapDateToLocation.auto.csv
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
