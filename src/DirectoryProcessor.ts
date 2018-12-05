// TODO xxx refactor this file!
import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";
import { cat } from "shelljs";

import { ImageClassifier } from "./ImageClassifier";

let hasError = false;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;

export namespace DirectoryProcessor {
    export async function processDirectory(
        imageInputDir: string,
        imageOutputDir: string,
        filenameFormat: string
    ): Promise<boolean> {
        try {
            await processImageDirectory(imageInputDir, filenameFormat, imageOutputDir);

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
    console.log(`${fileCount} files were processed`);

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

async function processImageDirectory(
    imageInputDir: string,
    filenameFormat: string,
    imageOutputDir: string
): Promise<undefined> {
    const readdirPromise = () => {
        return new Promise<string[]>(function(ok, notOk) {
            fs.readdir(imageInputDir, function(err, _files) {
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

    return new Promise<undefined>((resolve, reject) => {
        // google API quota seems to be average rate per second
        // rather than 'total within 100s'.
        //
        // so deliberately slowing down the request rate, to avoid hitting the quota:

        let i = 0;
        const doNextImage = async () => {
            if (i < files.length) {
                let imagePath = files[i];

                let imageInPath = path.join(imageInputDir, imagePath);
                if (!isDirectory(imageInPath) && isFileExtensionOk(imagePath)) {
                    let isOk = true;
                    try {
                        isOk = await ImageClassifier.classifyImageAndMoveIt(
                            imageInPath,
                            filenameFormat,
                            imageOutputDir
                        );
                    } catch (err) {
                        console.error("DP: error");
                        handleError(err);
                        isOk = false;
                    }

                    if (!isOk) {
                        handleError("DP: error occurred");
                    }
                } else {
                    console.warn(`skipping file ${imagePath} (is dir or a skipped file extension)`);
                }

                i++;

                if (i < files.length) {
                    setTimeout(() => {
                        doNextImage();
                    }, DELAY_BETWEEN_API_REQUESTS_IN_MILLIS);
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
