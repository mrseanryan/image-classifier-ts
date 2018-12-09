// - replace callbacks with promise - async/await
import * as fs from "fs";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";

import { GoogleVision } from "./GoogleVision";
import { ImageProperties } from "./model/ImageProperties";
import { ArrayUtils } from "./utils/ArrayUtils";

const vision = require("@google-cloud/vision");

// TODO xxx move out to DefaultArgs
const MIN_SCORE_ACCEPTED = 0.7;
const TOP_N_LABELS = 3;

const visionClient = new vision.ImageAnnotatorClient();

export namespace ImageClassifier {
    // TODO xxx add option type: topN=3, minScore
    export async function classifyImage(properties: ImageProperties): Promise<ImageProperties> {
        return new Promise<ImageProperties>((resolve, reject) => {
            _classifyImageWithResize(
                properties,
                error => {
                    console.error(`error with file ${properties.imagePath}`, error);
                    reject(error);
                },
                newProperties => resolve(newProperties)
            );
        });
    }

    export function _classifyImageWithResize(
        properties: ImageProperties,
        handleError: (error: any) => void,
        done: (newProperties: ImageProperties) => void
    ) {
        console.log(`detecting labels in image: '${properties.imagePath}'`);

        const activeProperties = ImageProperties.withFileSizeMb(
            properties,
            getFilesizeInMegaBytes(properties.imagePath)
        );
        if (activeProperties.fileSizeMb === null) {
            handleError(`could not get file size for image '${activeProperties.imagePath}'`);
            done(activeProperties);
            return;
        }
        if (activeProperties.fileSizeMb > 0.5) {
            console.log(
                `    'file is large! - ${activeProperties.fileSizeMb} Mb - will use resized copy...`
            );

            resizeImage(activeProperties.imagePath, handleError, (resizedImagePath, err) => {
                if (err) {
                    handleError(err);
                } else {
                    if (!resizedImagePath) {
                        throw new Error("unexpected: newImagePath is not set!");
                    }

                    classifySmallImage(activeProperties, handleError, done);
                }
            });
        } else {
            classifySmallImage(activeProperties, handleError, done);
        }
    }

    const getFilesizeInMegaBytes = (filename: string) => {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes / (1024 * 1024);
    };

    // ref: https://github.com/lovell/sharp
    const resizeImage = (
        filePath: string,
        handleError: (error: any) => void,
        cb: (outPath: string | null, err: any) => void
    ) => {
        const outPath = path.join(os.tmpdir(), path.basename(filePath) + ".resized.jpg");

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

    const _classifyImage = (
        imagePath: string,
        handleError: (error: any) => void,
        cb: (topNLabels: string[] | null) => void
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

                let topNLabels = null;

                if (labels && labels.length > 0) {
                    // note: results already have the best one first:
                    const topLabels = _.take(
                        labels.filter(
                            l => l.score >= MIN_SCORE_ACCEPTED && isLabelOk(l.description)
                        ),
                        TOP_N_LABELS
                    ).map(l => ArrayUtils.replaceAll(l.description, " ", "-"));

                    if (topLabels.length > 0) {
                        topNLabels = topLabels;
                    }
                } else {
                    console.error("no labels returned from API!");
                }

                // TODO xxx replace cb with async await
                cb(topNLabels);
            })
            .catch((err: any) => {
                handleError(err);
            });
    };

    // ignore generic labels like: vertebrate -> take the next one...
    const isLabelOk = (label: string) => {
        return ["vertebrate"].indexOf(label) === -1;
    };

    const classifySmallImage = (
        properties: ImageProperties,
        handleError: (error: any) => void,
        done: (properties: ImageProperties) => void
    ) => {
        _classifyImage(properties.imagePath, handleError, topNLabels => {
            if (topNLabels) {
                const activeProperties = ImageProperties.withTopLabels(properties, topNLabels);

                done(activeProperties);
            } else {
                console.warn("got no labels from Google");
                done(properties);
            }
        });
    };
}
