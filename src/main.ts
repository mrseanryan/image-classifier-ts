// TODO xxx refactor this file!
import * as fs from "fs";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";

import { GoogleVision } from "./GoogleVision";
import { ImageClassifier } from "./ImageClassifier";
import { ArrayUtils } from "./utils/ArrayUtils";
import { FileFormatToken, FilenameGenerator, FileNameTokens } from "./utils/FilenameGenerator";
import { FileUtils } from "./utils/FileUtils";

const vision = require("@google-cloud/vision");

const MIN_SCORE_ACCEPTED = 0.7;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;
const TOP_N_LABELS = 3;

const visionClient = new vision.ImageAnnotatorClient();

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

// TODO xxx - get city/region (country)
/**
 * - first identify all images that have a lat/long
 * - take 1 such image for each date
 * - for each image, send lat/long to geolocation service -> locationDescription
 * - THEN run the image classifcation
 * - when generating new filename, try map image date -> locationDescription
 */

const isOk = ImageClassifier.classifyAndMoveImages(imageInputDir, imageOutputDir, filenameFormat);

if (isOk) {
    console.log("[done]");
} else {
    console.error("[errors occurred]");
}
