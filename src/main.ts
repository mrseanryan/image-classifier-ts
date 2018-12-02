// TODO xxx refactor this file!
import * as fs from "fs";
import * as _ from "lodash";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";

import { GoogleVision } from "./GoogleVision";

const vision = require("@google-cloud/vision");

const MIN_SCORE_ACCEPTED = 0.7;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;
const TOP_N_LABELS = 3;

const visionClient = new vision.ImageAnnotatorClient();

let imageInputDir = "";
let imageOutputDir = os.tmpdir();
let isMovingToDir = false;

let _showUsage = () => {
    let scriptName = "node " + process.argv[1];
    console.log(`USAGE: ${scriptName} <path to input dir> <path to output dir> -isMovingToDir`);
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
            if (process.argv[4] === "-isMovingToDir") {
                isMovingToDir = true;
            } else {
                _showUsage();
                process.exit(666);
            }
            break;
        default:
            _showUsage();
            process.exit(666);
    }
};
_processArgs();

let hasError = false;

let handleError = (err: any) => {
    if (err) {
        console.error(err);
        hasError = true;
    }
};

let classifyImageAndMoveIt = (topImagePath: string, cbFinal: (error: any) => void) => {
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
                        }
                        handleError(sharpError);

                        cb(outPath, sharpError);
                    });
            }
        });
    };

    const classifyImage = (
        imagePath: string,
        cb: (topDesc: string | null, combinedDesc: string | null) => void
    ) => {
        console.info("classifying image:", imagePath);

        // ref: https://github.com/googleapis/nodejs-vision/blob/master/samples/detect.js
        // ref: https://cloud.google.com/nodejs/docs/reference/vision/0.22.x/
        //
        // ref: .\node_modules\@google-cloud\vision\src\index.js

        visionClient
            .labelDetection(imagePath)
            .then((results: any) => {
                const labels = results[0].labelAnnotations as GoogleVision.LabelAnnotation[];

                // debugging
                // console.log("Labels:");
                // labels.forEach(label => console.log(label.description));

                let topDesc = null;
                let combinedDesc = null;

                if (labels && labels.length > 0) {
                    // note: results already have the best one first:
                    const topLabels = _.take(
                        labels.filter(
                            l => l.score >= MIN_SCORE_ACCEPTED && isLabelOk(l.description)
                        ),
                        TOP_N_LABELS
                    ).map(l => replaceAll(l.description, " ", "-"));

                    if (topLabels.length > 0) {
                        topDesc = topLabels[0];

                        combinedDesc = topLabels.join("_");
                    }
                } else {
                    console.error("no labels returned from API!");
                }

                console.log(imagePath, `class = [${topDesc}]`);

                // TODO xxx replace cb with async await
                cb(topDesc, combinedDesc);
            })
            .catch((err: any) => {
                handleError(err);
            });
    };

    // ignore generic labels like: nature, vertebrate, fauna -> take the next one...
    const isLabelOk = (label: string) => {
        return ["nature", "vertebrate", "flora", "fauna"].indexOf(label) === -1;
    };

    const replaceAll = (label: string, token: string, replacement: string) =>
        label.split(token).join(replacement);

    const ensureDirExists = (dirPath: string, isEnabled: boolean, cb: () => void) => {
        // TODO rewrite to NOT use sync methods
        if (isEnabled && !fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        cb();
    };

    const moveImage = (
        imagePath2: string,
        outDir: string,
        topDesc: string,
        combinedDesc: string,
        cb: (error: any) => void
    ) => {
        let activeOutDir = outDir;
        ensureDirExists(outDir, true, () => {
            if (isMovingToDir) {
                activeOutDir = path.join(outDir, topDesc);
            }

            ensureDirExists(activeOutDir, isMovingToDir, () => {
                let filename = path.basename(imagePath2);
                const newFilename = `${combinedDesc}--${filename}`;
                const newPath = path.join(activeOutDir, newFilename);

                console.log("moving image ", imagePath2, " => ", newPath);
                fs.rename(imagePath2, newPath, cb);
            });
        });
    };

    let classifyAndMoveSmallImage = (imagePath2: string, originalImagePath: string) => {
        classifyImage(imagePath2, (topDesc, combinedDesc) => {
            if (topDesc) {
                if (!combinedDesc) {
                    throw new Error("unexpected - topDesc is set but not combinedDesc");
                }

                moveImage(originalImagePath, imageOutputDir, topDesc, combinedDesc, cbFinal);
            } else {
                console.warn("skipping image - no label");
            }
        });
    };

    // TODO xxx move out the above functions
    let fileSizeMb = getFilesizeInMegaBytes(topImagePath);
    if (fileSizeMb > 0.5) {
        console.log(`    'file is large! - ${fileSizeMb} Mb - will use resized copy...`);

        resizeImage(topImagePath, (newImagePath, err) => {
            handleError(err);
            if (!err) {
                if (!newImagePath) {
                    throw new Error("unexpected: newImagePath is not set!");
                }

                classifyAndMoveSmallImage(newImagePath, topImagePath);
            }
        });
    } else {
        classifyAndMoveSmallImage(topImagePath, topImagePath);
    }
};

let finish = (fileCount: number) => {
    console.log(`${fileCount} files were processed`);

    if (hasError) {
        console.error("errors occurred!");
        process.exit(777);
    }
};

let isFileExtensionOk = (filepath: string) => {
    if (filepath.endsWith(".dropbox")) {
        return false;
    }

    // extensions - works for files with something before the '.'
    let ext = path.extname(filepath);
    let badExtensions = [".ini", ".mp4", ".mpg", ".mov"];

    return !badExtensions.some(badExt => badExt.toLowerCase() === ext.toLowerCase());
};

let isDirectory = (filepath: string) => {
    return fs.lstatSync(filepath).isDirectory();
};

fs.readdir(imageInputDir, (fsError: any, files) => {
    handleError(fsError);

    console.log(`found ${files.length} files to process`);

    // google API quota seems to be average rate per second
    // rather than 'total within 100s'.
    //
    // so deliberately slowing down the request rate, to avoid hitting the quota:

    let i = 0;
    let doNextImage = () => {
        if (i < files.length) {
            let imagePath = files[i];

            let imageInPath = path.join(imageInputDir, imagePath);
            if (!isDirectory(imageInPath) && isFileExtensionOk(imagePath)) {
                classifyImageAndMoveIt(imageInPath, (error: any) => {
                    handleError(error);
                });
            } else {
                console.log(`skipping file ${imagePath} (is dir or a skipped file extension)`);
            }
            i++;
        }

        if (i < files.length) {
            setTimeout(() => {
                doNextImage();
            }, DELAY_BETWEEN_API_REQUESTS_IN_MILLIS);
        } else {
            finish(files.length);
        }
    };

    doNextImage();
});
