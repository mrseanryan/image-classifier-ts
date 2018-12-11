import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { ImageProperties } from "./model/ImageProperties";
import { Options } from "./utils/args/Args";
import { FileFormatToken, FilenameGenerator, FileNameTokens } from "./utils/FilenameGenerator";
import { FileUtils } from "./utils/FileUtils";
import { MapDateToLocationManager } from "./utils/MapDateToLocationManager";

const renamePromise = promisify(fs.rename);

export namespace ImageMover {
    export async function move(
        imageProps: ImageProperties,
        options: Options,
        imageOutputDir: string,
        mapDateToLocationManager: MapDateToLocationManager
    ): Promise<boolean> {
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
        } else if (FilenameGenerator.doesFormatIncludeLocation(options.filenameFormat)) {
            console.warn(
                `skipping: Filename format includes a location, but the location of this photo is unknown.`
            );

            return false;
        }

        const newFilename = FilenameGenerator.generateFilename(tokens, options.filenameFormat);

        const subDir = path.dirname(newFilename);
        FileUtils.ensureSubDirsExist(imageOutputDir, subDir);

        const newPath = path.join(imageOutputDir, newFilename);

        if (!options.replaceOnMove && fs.existsSync(newPath)) {
            console.warn(`skipping: file already exists at ${newPath}`);
            return false;
        }

        console.log("moving image ", imageProps.imagePath, " => ", newPath);

        await renamePromise(imageProps.imagePath, newPath);

        return true;
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
