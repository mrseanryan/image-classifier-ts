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
import { MapDateToLocation } from "./utils/MapDateToLocation";
import { MapDateToLocationManager } from "./utils/MapDateToLocationManager";

let hasError = false;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;

export namespace DirectoryProcessor {
    export async function processDirectory(args: Args): Promise<boolean> {
        try {
            const results = await processImageDirectory(args);
            dumpResults(results);

            console.log("[processDirectory] - done");
            return !hasError;
        } catch (error) {
            console.error("[processDirectory] error", error);
            return false;
        }
    }
}

function dumpResults(results: ResultsByPhase) {
    results.forEach((value, key) => {
        console.log(Phase[key], value);
    });
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
    GeoCode,
    ClassifyAndMove
}

export type ResultsByPhase = Map<Phase, ProcessResultForPhase>;

async function processImageDirectory(args: Args): Promise<ResultsByPhase> {
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
        console.error(error);
        return resultsByPhase;
    }
    console.log(`found ${files.length} files to process`);

    const imageProperties = getAllImageProperties(files, args);

    const mapDateToLocationManager = MapDateToLocationManager.fromImageDirectory(
        path.dirname(args.imageInputDir),
        args.options
    );

    logThisPhase(Phase.GeoCode);
    if (args.options.geoCode) {
        const geoResult = await processImagesForPhase(
            imageProperties,
            Phase.GeoCode,
            args,
            mapDateToLocationManager
        );
        resultsByPhase.set(Phase.GeoCode, geoResult);
    } else {
        console.log("geo locate: skipping - geo locate option is not enabled");
    }

    mapDateToLocationManager.dumpAutoMapToDisk(args.imageInputDir);

    logThisPhase(Phase.ClassifyAndMove);
    const classifyResult = await processImagesForPhase(
        imageProperties,
        Phase.ClassifyAndMove,
        args,
        mapDateToLocationManager
    );
    resultsByPhase.set(Phase.ClassifyAndMove, classifyResult);

    return resultsByPhase;
}

function logThisPhase(phase: Phase) {
    console.log(`\n=== ${Phase[phase]} phase ===`);
}

function getAllImageProperties(files: string[], args: Args): ImageProperties[] {
    return files
        .map(filepath => {
            const imagePath = path.join(args.imageInputDir, filepath);

            if (isDirectory(imagePath) || !isFileExtensionOk(imagePath)) {
                console.warn(`\nskipping file ${imagePath} (is dir or a skipped file extension)`);

                return null;
            }

            return new ImageProperties(imagePath, [], ExifUtils.readFile(imagePath) || undefined);
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
    mapDateToLocationManager: MapDateToLocationManager
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
                    console.log(`\nprocessing image at ${thisImageProperties.imagePath}`);

                    switch (phase) {
                        case Phase.ClassifyAndMove:
                            const didMove = await doClassifyPhaseForImage(
                                thisImageProperties,
                                args,
                                mapDateToLocationManager
                            );
                            if (didMove) {
                                result.imagesProcessedOk++;
                            }
                            break;
                        case Phase.GeoCode:
                            const geoProperties = await doGeoCodePhaseForImage(
                                thisImageProperties,
                                args.options,
                                mapDateToLocationManager.autoMap
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
                    console.error("DP: error");
                    handleError(err);
                    isOk = false;
                }

                if (!isOk) {
                    handleError("DP: error occurred");
                }

                i++;

                if (i < imageProperties.length) {
                    setTimeout(() => {
                        doNextImage();
                    }, getDelayForPhase(phase));
                } else {
                    finish(imageProperties.length);

                    console.log("DP: resolving");
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
    mapDateToLocationManager: MapDateToLocationManager
): Promise<boolean> {
    const imageProps = await ImageClassifier.classifyImage(properties, args.options);

    ConsoleReporter.report(imageProps);

    if (!args.options.dryRun) {
        return await ImageMover.move(
            imageProps,
            args.options,
            args.imageOutputDir,
            mapDateToLocationManager
        );
    }

    return false;
}

async function doGeoCodePhaseForImage(
    properties: ImageProperties,
    options: Options,
    autoMapDateToLocation: MapDateToLocation
): Promise<ImageProperties> {
    const geoProps = await GeoCoder.processImage(properties, options, autoMapDateToLocation);

    ConsoleReporter.report(geoProps);

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
