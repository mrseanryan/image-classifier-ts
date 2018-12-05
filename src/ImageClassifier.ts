// TODO xxx refactor this file!
import * as fs from "fs";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";

import { GoogleVision } from "./GoogleVision";
import { ArrayUtils } from "./utils/ArrayUtils";
import { FileFormatToken, FilenameGenerator, FileNameTokens } from "./utils/FilenameGenerator";
import { FileUtils } from "./utils/FileUtils";
import { DEFAULT_LOCATION, MapDateToLocation } from "./utils/MapDateToLocation";

const vision = require("@google-cloud/vision");

const MIN_SCORE_ACCEPTED = 0.7;
const TOP_N_LABELS = 3;

const visionClient = new vision.ImageAnnotatorClient();

export namespace ImageClassifier {
    export async function classifyImageAndMoveIt(
        topImagePath: string,
        filenameFormat: string,
        imageOutputDir: string
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            _classifyImageAndMoveIt(
                topImagePath,
                filenameFormat,
                imageOutputDir,
                error => {
                    console.error(`error with file ${topImagePath}`, error);
                    reject(error);
                },
                () => resolve(true)
            );
        });
    }

    export function _classifyImageAndMoveIt(
        topImagePath: string,
        filenameFormat: string,
        imageOutputDir: string,
        handleError: (error: any) => void,
        done: () => void
    ) {
        console.log(`detecting labels in image: '${topImagePath}'`);

        let getFilesizeInMegaBytes = (filename: string) => {
            const stats = fs.statSync(filename);
            const fileSizeInBytes = stats.size;
            return fileSizeInBytes / (1024 * 1024);
        };

        // ref: https://github.com/lovell/sharp
        let resizeImage = (filePath: string, cb: (outPath: string | null, err: any) => void) => {
            let outPath = path.join(os.tmpdir(), path.basename(filePath) + ".resized.jpg");

            // read file to avoid issue where sharp does not release the file lock!
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error("Error reading file " + filePath, err);
                    cb(null, err);
                } else {
                    sharp(data)
                        .resize(800)
                        .toFile(outPath, (sharpError, info) => {
                            if (sharpError) {
                                console.error("Error resizing file " + filePath, sharpError);
                                handleError(sharpError);
                            }

                            cb(outPath, sharpError);
                        });
                }
            });
        };

        const classifyImage = (
            imagePath: string,
            cb: (topDesc: string | null, combinedDesc: string | null) => void
        ) => {
            console.info("  classifying image:", imagePath);

            // ref: https://github.com/googleapis/nodejs-vision/blob/master/samples/detect.js
            // ref: https://cloud.google.com/nodejs/docs/reference/vision/0.22.x/
            //
            // ref: .\node_modules\@google-cloud\vision\src\index.js

            visionClient
                .labelDetection(imagePath)
                .then((results: any) => {
                    const labels = results[0].labelAnnotations as GoogleVision.LabelAnnotation[];

                    let topDesc = null;
                    let combinedDesc = null;

                    if (labels && labels.length > 0) {
                        // note: results already have the best one first:
                        const topLabels = _.take(
                            labels.filter(
                                l => l.score >= MIN_SCORE_ACCEPTED && isLabelOk(l.description)
                            ),
                            TOP_N_LABELS
                        ).map(l => ArrayUtils.replaceAll(l.description, " ", "-"));

                        if (topLabels.length > 0) {
                            topDesc = topLabels[0];

                            combinedDesc = topLabels.join("_");
                        }
                    } else {
                        console.error("no labels returned from API!");
                    }

                    // TODO xxx replace cb with async await
                    cb(topDesc, combinedDesc);
                })
                .catch((err: any) => {
                    handleError(err);
                });
        };

        // ignore generic labels like: vertebrate -> take the next one...
        const isLabelOk = (label: string) => {
            return ["vertebrate"].indexOf(label) === -1;
        };

        const moveImage = (
            imagePath2: string,
            outDir: string,
            topDesc: string,
            combinedDesc: string,
            cb: (error: any) => void
        ) => {
            const tokens: FileNameTokens = new Map<FileFormatToken, string>();
            {
                let filename = path.basename(imagePath2);
                tokens.set(FileFormatToken.Filename, filename);
                tokens.set(FileFormatToken.TopLabel, topDesc);
                tokens.set(FileFormatToken.CombinedLabels, combinedDesc);
                tokens.set(FileFormatToken.Year, FileUtils.getModificationYearOfFile(imagePath2));
            }

            const mapDateToLocation = MapDateToLocation.parseFromCsv(path.dirname(imagePath2));

            tokens.set(
                FileFormatToken.Location,
                mapDateToLocation.getLocationForFile(imagePath2) || DEFAULT_LOCATION
            );

            const newFilename = FilenameGenerator.generateFilename(tokens, filenameFormat);

            const subDir = path.dirname(newFilename);
            FileUtils.ensureSubDirsExist(outDir, subDir);

            const newPath = path.join(outDir, newFilename);

            console.log("moving image ", imagePath2, " => ", newPath);
            fs.rename(imagePath2, newPath, cb);
        };

        const classifyAndMoveSmallImage = (imagePath2: string, originalImagePath: string) => {
            classifyImage(imagePath2, (topDesc, combinedDesc) => {
                if (topDesc) {
                    if (!combinedDesc) {
                        throw new Error("unexpected - topDesc is set but not combinedDesc");
                    }

                    moveImage(originalImagePath, imageOutputDir, topDesc, combinedDesc, done);
                } else {
                    console.warn("skipping image - no label");
                    done();
                }
            });
        };

        // TODO xxx move out the above functions
        let fileSizeMb = getFilesizeInMegaBytes(topImagePath);
        if (fileSizeMb > 0.5) {
            console.log(`    'file is large! - ${fileSizeMb} Mb - will use resized copy...`);

            resizeImage(topImagePath, (newImagePath, err) => {
                if (err) {
                    handleError(err);
                } else {
                    if (!newImagePath) {
                        throw new Error("unexpected: newImagePath is not set!");
                    }

                    classifyAndMoveSmallImage(newImagePath, topImagePath);
                }
            });
        } else {
            classifyAndMoveSmallImage(topImagePath, topImagePath);
        }
    }
}
