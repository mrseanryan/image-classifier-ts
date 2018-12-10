import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { ImageProperties } from "./model/ImageProperties";
import { FileFormatToken, FilenameGenerator, FileNameTokens } from "./utils/FilenameGenerator";
import { FileUtils } from "./utils/FileUtils";
import { MapDateToLocationManager } from "./utils/MapDateToLocationManager";

const renamePromise = promisify(fs.rename);

export namespace ImageMover {
    export async function move(
        imageProps: ImageProperties,
        filenameFormat: string,
        imageOutputDir: string,
        mapDateToLocationManager: MapDateToLocationManager
    ): Promise<void> {
        const tokens: FileNameTokens = new Map<FileFormatToken, string>();
        {
            const filename = path.basename(imageProps.imagePath);
            tokens.set(FileFormatToken.Filename, filename);
            tokens.set(FileFormatToken.TopLabel, imageProps.topLabel);
            tokens.set(FileFormatToken.CombinedLabels, imageProps.topLabels.join("_"));
            tokens.set(FileFormatToken.Year, imageProps.modificationDate.year.toString());
            tokens.set(FileFormatToken.FileSizeMb, imageProps.fileSizeMbText);
        }

        const location = getLocation(imageProps, mapDateToLocationManager);
        if (location) {
            tokens.set(FileFormatToken.Location, location);
        } else if (FilenameGenerator.doesFormatIncludeLocation(filenameFormat)) {
            console.warn(
                `skipping: Filename format includes a location, but the location of this photo is unknown.`
            );

            // TODO xxx return true if moved - then can count total number of images moved
            return Promise.resolve();
        }

        const newFilename = FilenameGenerator.generateFilename(tokens, filenameFormat);

        const subDir = path.dirname(newFilename);
        FileUtils.ensureSubDirsExist(imageOutputDir, subDir);

        const newPath = path.join(imageOutputDir, newFilename);

        console.log("moving image ", imageProps.imagePath, " => ", newPath);

        return renamePromise(imageProps.imagePath, newPath);
    }

    function getLocation(
        imageProps: ImageProperties,
        mapDateToLocationManager: MapDateToLocationManager
    ): string | null {
        // prefer geo-coding if available:
        if (imageProps.location && imageProps.location.completionScore > 0) {
            return imageProps.location.toString();
        }

        const location = mapDateToLocationManager.getLocationForFile(imageProps.imagePath);
        return location;
    }
}
