import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";

import { ImageClassifier } from "./classify/ImageClassifier";
import { GeoCoder } from "./geoCode/GeoCoder";
import { ImageMover } from "./ImageMover";
import { ImageProperties } from "./model/ImageProperties";
import { Args, Options } from "./utils/args/Args";
import { ConsoleReporter } from "./utils/ConsoleReporter";
import { ExifUtils } from "./utils/ExifUtils";
import { FileUtils } from "./utils/FileUtils";
import { ImageDimensions } from "./utils/ImageDimensions";
import { MapDateToLocation } from "./utils/MapDateToLocation";
import { MapDateToLocationManager } from "./utils/MapDateToLocationManager";
import { IOutputter } from "./utils/output/IOutputter";
import { Verbosity } from "./utils/output/Verbosity";

let hasError = false;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;

export namespace DirectoryProcessor {
    export async function processDirectory(args: Args, outputter: IOutputter): Promise<boolean> {
        try {
            const results = await processImageDirectory(args, outputter);
            dumpResults(results, outputter);

            outputter.infoVerbose("[processDirectory] - done");
            return !hasError;
        } catch (error) {
            outputter.errorVerbose("[processDirectory] error", error);
            return false;
        }
    }
}

function dumpResults(results: ResultsByPhase, outputter: IOutputter) {
    results.forEach((value, key) => {
        outputter.info(Phase[key], value);
    });
}

const handleError = (err: any, outputter: IOutputter) => {
    if (err) {
        outputter.error(err);
        hasError = true;
    }
};

const finish = (fileCount: number, outputter: IOutputter) => {
    outputter.info(`\n${fileCount} files were processed`);

    if (hasError) {
        outputter.error("errors occurred");
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
    GeoCode,
    ClassifyAndMove
}

export type ResultsByPhase = Map<Phase, ProcessResultForPhase>;

async function processImageDirectory(args: Args, outputter: IOutputter): Promise<ResultsByPhase> {
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
    const resultsByPhase: ResultsByPhase = new Map<Phase, ProcessResultForPhase>();

    try {
        files = await readdirPromise();
    } catch (error) {
        outputter.error(error);
        return resultsByPhase;
    }
    outputter.info(`found ${files.length} files to process`);

    const imageProperties = getAllImageProperties(files, args, outputter);

    const mapDateToLocationManager = MapDateToLocationManager.fromImageDirectory(
        args.imageInputDir,
        args.options
    );

    logThisPhase(Phase.GeoCode, outputter);
    if (args.options.geoCode) {
        const geoResult = await processImagesForPhase(
            imageProperties,
            Phase.GeoCode,
            args,
            mapDateToLocationManager,
            outputter
        );
        resultsByPhase.set(Phase.GeoCode, geoResult);
    } else {
        outputter.info("geo locate: skipping - geo locate option is not enabled");
    }

    mapDateToLocationManager.dumpAutoMapToDisk(args.imageInputDir);

    logThisPhase(Phase.ClassifyAndMove, outputter);

    const classifyResult = await processImagesForPhase(
        imageProperties,
        Phase.ClassifyAndMove,
        args,
        mapDateToLocationManager,
        outputter
    );
    resultsByPhase.set(Phase.ClassifyAndMove, classifyResult);

    return resultsByPhase;
}

function logThisPhase(phase: Phase, outputter: IOutputter) {
    outputter.info(`\n=== ${Phase[phase]} phase ===`);
}

function getAllImageProperties(
    files: string[],
    args: Args,
    outputter: IOutputter
): ImageProperties[] {
    return files
        .map(filepath => {
            const imagePath = path.join(args.imageInputDir, filepath);

            if (isDirectory(imagePath) || !isFileExtensionOk(imagePath)) {
                outputter.warnVerbose(
                    `\nskipping file ${imagePath} (is dir or a skipped file extension)`
                );

                return null;
            }

            return new ImageProperties(
                imagePath,
                [],
                ExifUtils.readFile(imagePath, outputter) || undefined,
                ImageDimensions.getDimensions(imagePath)
            );
        })
        .filter(f => !!f) as ImageProperties[];
}

type ProcessResultForPhase = {
    imagesProcessedOk: number;
};

async function processImagesForPhase(
    imageProperties: ImageProperties[],
    phase: Phase,
    args: Args,
    mapDateToLocationManager: MapDateToLocationManager,
    outputter: IOutputter
): Promise<ProcessResultForPhase> {
    return new Promise<ProcessResultForPhase>((resolve, reject) => {
        let result: ProcessResultForPhase = {
            imagesProcessedOk: 0
        };
        let i = 0;
        const doNextImage = async () => {
            if (i < imageProperties.length) {
                const thisImageProperties = imageProperties[i];

                let isOk = true;
                try {
                    outputter.infoVerbose("\n");
                    outputter.info(`processing image at ${thisImageProperties.imagePath}`);

                    switch (phase) {
                        case Phase.ClassifyAndMove:
                            const didMove = await doClassifyPhaseForImage(
                                thisImageProperties,
                                args,
                                mapDateToLocationManager,
                                outputter
                            );
                            if (didMove) {
                                result.imagesProcessedOk++;
                            }
                            break;
                        case Phase.GeoCode:
                            const geoProperties = await doGeoCodePhaseForImage(
                                thisImageProperties,
                                args.options,
                                mapDateToLocationManager.autoMap,
                                outputter
                            );
                            if (geoProperties.location) {
                                Object.assign(thisImageProperties, {
                                    location: geoProperties.location
                                });
                            }

                            if (geoProperties.location) {
                                result.imagesProcessedOk++;
                            }
                            break;
                        default:
                            throw new Error(`unhandled Phase ${[phase]}`);
                    }
                } catch (err) {
                    outputter.errorVerbose("DP: error");
                    handleError(err, outputter);
                    isOk = false;
                }

                if (!isOk) {
                    handleError("DP: error occurred", outputter);
                }

                i++;

                if (i < imageProperties.length) {
                    setTimeout(() => {
                        doNextImage();
                    }, getDelayForPhase(phase));
                } else {
                    finish(imageProperties.length, outputter);

                    resolve(result);
                }
            }
        };

        doNextImage();
    });
}

async function doClassifyPhaseForImage(
    properties: ImageProperties,
    args: Args,
    mapDateToLocationManager: MapDateToLocationManager,
    outputter: IOutputter
): Promise<boolean> {
    const imageProps = await ImageClassifier.classifyImage(properties, args.options, outputter);

    ConsoleReporter.report(imageProps, outputter);

    if (!args.options.dryRun) {
        return await ImageMover.move(
            imageProps,
            args.options,
            args.imageOutputDir,
            mapDateToLocationManager,
            outputter
        );
    }

    return false;
}

async function doGeoCodePhaseForImage(
    properties: ImageProperties,
    options: Options,
    autoMapDateToLocation: MapDateToLocation,
    outputter: IOutputter
): Promise<ImageProperties> {
    const geoProps = await GeoCoder.processImage(
        properties,
        options,
        autoMapDateToLocation,
        outputter
    );

    if (outputter.verbosity === Verbosity.High) {
        ConsoleReporter.report(geoProps, outputter);
    }

    return geoProps;
}

// Google API quota seems to be average rate per second
// rather than 'total within 100s'.
//
// so deliberately slowing down the request rate, to avoid hitting the quota:
function getDelayForPhase(phase: Phase): number {
    switch (phase) {
        case Phase.ClassifyAndMove:
        case Phase.GeoCode:
            return DELAY_BETWEEN_API_REQUESTS_IN_MILLIS;
        default:
            throw new Error(`unhandled Phase ${[phase]}`);
    }
}
