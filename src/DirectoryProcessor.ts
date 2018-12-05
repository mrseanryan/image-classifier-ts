// TODO xxx refactor this file!
import * as fs from "fs";
import * as _ from "lodash";
import * as path from "path";

import { ImageClassifier } from "./ImageClassifier";

let hasError = false;
const DELAY_BETWEEN_API_REQUESTS_IN_MILLIS = 1000 / 20;

export namespace DirectoryProcessor {
    export function processDirectory(
        imageInputDir: string,
        imageOutputDir: string,
        filenameFormat: string
    ): boolean {
        processImageDirectory(imageInputDir, filenameFormat, imageOutputDir);

        return !hasError;
    }
}

const handleError = (err: any) => {
    if (err) {
        console.error(err);
        hasError = true;
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
    let badExtensions = [".csv", ".ini", ".mp4", ".mpg", ".mov"];

    return !badExtensions.some(badExt => badExt.toLowerCase() === ext.toLowerCase());
};

let isDirectory = (filepath: string) => {
    return fs.lstatSync(filepath).isDirectory();
};

const processImageDirectory = (
    imageInputDir: string,
    filenameFormat: string,
    imageOutputDir: string
) => {
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
                    ImageClassifier.classifyImageAndMoveIt(
                        imageInPath,
                        filenameFormat,
                        imageOutputDir,
                        handleError
                    );
                } else {
                    console.warn(`skipping file ${imagePath} (is dir or a skipped file extension)`);
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
};
