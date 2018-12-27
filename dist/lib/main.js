"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DirectoryProcessor_1 = require("./DirectoryProcessor");
var ArgsParser_1 = require("./utils/args/ArgsParser");
var OutputterFactory_1 = require("./utils/output/OutputterFactory");
var args = ArgsParser_1.ArgsParser.getArgs();
if (!args) {
    process.exit(666);
}
var outputter = OutputterFactory_1.OutputterFactory.create(args.options.verbosity);
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
DirectoryProcessor_1.DirectoryProcessor.processDirectory(args, outputter)
    .then(function (result) {
    if (result.isOk) {
        console.log("[done]");
    }
    else {
        console.error("main: [errors occurred]");
    }
})
    .catch(function (error) {
    console.error("main: [error occurred]", error);
});
//# sourceMappingURL=main.js.map