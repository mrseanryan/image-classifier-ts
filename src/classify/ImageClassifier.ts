// - replace callbacks with promise - async/await
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { ImageProperties } from "../model/ImageProperties";
import { Options } from "../utils/args/Args";
import { Nodash } from "../utils/Nodash";
import { IOutputter } from "../utils/output/IOutputter";
import { StringUtils } from "../utils/StringUtils";
import { GoogleVision } from "./GoogleVision";

const sharp = require("sharp");

const vision = require("@google-cloud/vision");

const visionClient = new vision.ImageAnnotatorClient();

export namespace ImageClassifier {
    export async function classifyImage(
        properties: ImageProperties,
        options: Options,
        outputter: IOutputter
    ): Promise<ImageProperties> {
        return new Promise<ImageProperties>((resolve, reject) => {
            _classifyImageWithResize(
                properties,
                options,
                outputter,
                error => {
                    outputter.error(`error with file ${properties.imagePath}`, error);
                    reject(error);
                },
                newProperties => resolve(newProperties)
            );
        });
    }

    export function _classifyImageWithResize(
        properties: ImageProperties,
        options: Options,
        outputter: IOutputter,
        handleError: (error: any) => void,
        done: (newProperties: ImageProperties) => void
    ) {
        outputter.infoVerbose(`detecting labels in image: '${properties.imagePath}'`);

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
            outputter.infoVerbose(
                `    'file is large! - ${activeProperties.fileSizeMb} Mb - will use resized copy...`
            );

            resizeImage(
                activeProperties.imagePath,
                outputter,
                handleError,
                (resizedImagePath, err) => {
                    if (err) {
                        handleError(err);
                    } else {
                        if (!resizedImagePath) {
                            throw new Error("unexpected: newImagePath is not set");
                        }

                        classifySmallImage(activeProperties, options, outputter, handleError, done);
                    }
                }
            );
        } else {
            classifySmallImage(activeProperties, options, outputter, handleError, done);
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
        outputter: IOutputter,
        handleError: (error: any) => void,
        cb: (outPath: string | null, err: any) => void
    ) => {
        const outPath = path.join(os.tmpdir(), path.basename(filePath) + ".resized.jpg");

        // read file to avoid issue where sharp does not release the file lock!
        fs.readFile(filePath, (err, data) => {
            if (err) {
                outputter.error("Error reading file " + filePath, err);
                cb(null, err);
            } else {
                sharp(data)
                    .resize(800)
                    .toFile(outPath, (sharpError: any) => {
                        if (sharpError) {
                            outputter.error("Error resizing file " + filePath, sharpError);
                            handleError(sharpError);
                        }

                        cb(outPath, sharpError);
                    });
            }
        });
    };

    const _classifyImage = (
        imagePath: string,
        options: Options,
        outputter: IOutputter,
        handleError: (error: any) => void,
        cb: (topNLabels: string[] | null) => void
    ) => {
        outputter.infoVerbose("  classifying image:", imagePath);

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
                    const topLabels = Nodash.take(
                        labels.filter(l => l.score >= options.minScore && isLabelOk(l.description)),
                        options.topNLabels
                    ).map(l => StringUtils.replaceAll(l.description, " ", "-"));

                    if (topLabels.length > 0) {
                        topNLabels = topLabels;
                    }
                } else {
                    outputter.errorVerbose("no labels returned from Google Vision API");
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
        options: Options,
        outputter: IOutputter,
        handleError: (error: any) => void,
        done: (properties: ImageProperties) => void
    ) => {
        _classifyImage(properties.imagePath, options, outputter, handleError, topNLabels => {
            if (topNLabels) {
                const activeProperties = ImageProperties.withTopLabels(properties, topNLabels);

                done(activeProperties);
            } else {
                outputter.warn("No labels were returned from classification (Google Vision API)");
                done(properties);
            }
        });
    };
}
