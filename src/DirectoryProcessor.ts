import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";

import { ImageClassifier } from "./ImageClassifier";
import { ImageMover } from "./ImageMover";
import { ImageProperties } from "./model/ImageProperties";
import { Args } from "./utils/args/Args";
import { ConsoleReporter } from "./utils/ConsoleReporter";

let hasError = false;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;

export namespace DirectoryProcessor {
    export async function processDirectory(args: Args): Promise<boolean> {
        try {
            await processImageDirectory(args);

            console.log("[processDirectory] - done");
            return !hasError;
        } catch (error) {
            console.error("[processDirectory] error", error);
            return false;
        }
    }
}

const handleError = (err: any) => {
    if (err) {
        console.error(err);
        hasError = true;
    }
};

const finish = (fileCount: number) => {
    console.log(`\n${fileCount} files were processed`);

    if (hasError) {
        console.error("errors occurred!");
        process.exit(777);
    }
};

const isFileExtensionOk = (filepath: string) => {
    if (filepath.endsWith(".dropbox")) {
        return false;
    }

    // extensions - works for files with something before the '.'
    const ext = path.extname(filepath);
    const badExtensions = [".csv", ".ini", ".mp4", ".mpg", ".mov"];

    return !badExtensions.some(badExt => badExt.toLowerCase() === ext.toLowerCase());
};

const isDirectory = (filepath: string) => {
    return fs.lstatSync(filepath).isDirectory();
};

enum Phase {
    GeoLocate,
    Classify
}

async function processImageDirectory(args: Args): Promise<undefined> {
    const readdirPromise = () => {
        return new Promise<string[]>(function(ok, notOk) {
            fs.readdir(args.imageInputDir, function(err, _files) {
                if (err) {
                    notOk(err);
                } else {
                    ok(_files);
                }
            });
        });
    };

    let files: string[];
    try {
        files = await readdirPromise();
    } catch (error) {
        console.error(error);
        return;
    }
    console.log(`found ${files.length} files to process`);

    logThisPhase(Phase.GeoLocate);
    if (args.options.geoLocate) {
        await classifyImages(files, Phase.GeoLocate, args);
    } else {
        console.log("geo locate: skipping - geo locate option is not enabled");
    }

    logThisPhase(Phase.Classify);
    await classifyImages(files, Phase.Classify, args);
}

function logThisPhase(phase: Phase) {
    console.log(`\n=== ${Phase[phase]} phase ===`);
}

async function classifyImages(files: string[], phase: Phase, args: Args): Promise<undefined> {
    return new Promise<undefined>((resolve, reject) => {
        let i = 0;
        const doNextImage = async () => {
            if (i < files.length) {
                let imagePath = files[i];

                let imageInPath = path.join(args.imageInputDir, imagePath);
                if (!isDirectory(imageInPath) && isFileExtensionOk(imagePath)) {
                    let isOk = true;
                    try {
                        console.log(`\nprocessing image at ${imageInPath}`);

                        const properties = new ImageProperties(imageInPath);

                        switch (phase) {
                            case Phase.Classify:
                                await doClassifyPhaseForImage(properties, args);
                                break;
                            case Phase.GeoLocate:
                                await doGeoLocatePhaseForImage(properties, args);
                                break;
                            default:
                                throw new Error(`unhandled Phase ${[phase]}`);
                        }
                    } catch (err) {
                        console.error("DP: error");
                        handleError(err);
                        isOk = false;
                    }

                    if (!isOk) {
                        handleError("DP: error occurred");
                    }
                } else {
                    console.warn(
                        `\nskipping file ${imagePath} (is dir or a skipped file extension)`
                    );
                }

                i++;

                if (i < files.length) {
                    setTimeout(() => {
                        doNextImage();
                    }, getDelayForPhase(phase));
                } else {
                    finish(files.length);

                    console.log("DP: resolving");
                    resolve();
                }
            }
        };

        doNextImage();
    });
}

async function doClassifyPhaseForImage(properties: ImageProperties, args: Args) {
    const imageProps = await ImageClassifier.classifyImage(properties, args.options);

    ConsoleReporter.report(imageProps);

    if (!args.options.dryRun) {
        await ImageMover.move(imageProps, args.options.filenameFormat, args.imageOutputDir);
    }
}

async function doGeoLocatePhaseForImage(properties: ImageProperties, args: Args) {
    // xxx
}

// Google API quota seems to be average rate per second
// rather than 'total within 100s'.
//
// so deliberately slowing down the request rate, to avoid hitting the quota:
function getDelayForPhase(phase: Phase): number {
    switch (phase) {
        case Phase.Classify:
        case Phase.GeoLocate:
            return DELAY_BETWEEN_API_REQUESTS_IN_MILLIS;
        default:
            throw new Error(`unhandled Phase ${[phase]}`);
    }
}
