import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { ImageProperties } from "./model/ImageProperties";
import { Options } from "./utils/args/Args";
import { FileFormatToken, FilenameGenerator, FileNameTokens } from "./utils/FilenameGenerator";
import { FileUtils } from "./utils/FileUtils";
import { MapDateToLocationManager } from "./utils/MapDateToLocationManager";
import { IOutputter } from "./utils/output/IOutputter";

const renamePromise = promisify(fs.rename);

export namespace ImageMover {
    export async function move(
        imageProps: ImageProperties,
        options: Options,
        imageOutputDir: string,
        mapDateToLocationManager: MapDateToLocationManager,
        outputter: IOutputter
    ): Promise<boolean> {
        const tokens: FileNameTokens = new Map<FileFormatToken, string>();
        {
            const filename = path.basename(imageProps.imagePath);
            tokens.set(FileFormatToken.Filename, filename);
            tokens.set(FileFormatToken.TopLabel, imageProps.topLabel);
            tokens.set(FileFormatToken.CombinedLabels, imageProps.topLabels.join("_"));
            tokens.set(
                FileFormatToken.Year,
                imageProps.modificationDate(outputter).year.toString()
            );
            tokens.set(FileFormatToken.FileSizeMb, imageProps.fileSizeMbText);
        }

        const location = getLocation(imageProps, mapDateToLocationManager, outputter);
        if (location) {
            tokens.set(FileFormatToken.Location, location);
        } else if (FilenameGenerator.doesFormatIncludeLocation(options.filenameFormat)) {
            outputter.warn(
                `skipping: Filename format includes a location, but the location of this photo is unknown.`
            );

            return false;
        }

        const newFilename = FilenameGenerator.generateFilename(tokens, options.filenameFormat);

        const subDir = path.dirname(newFilename);
        FileUtils.ensureSubDirsExist(imageOutputDir, subDir);

        const newPath = path.join(imageOutputDir, newFilename);

        if (!options.replaceOnMove && fs.existsSync(newPath)) {
            outputter.warn(`skipping: file already exists at ${newPath}`);
            return false;
        }

        outputter.info("moving image ", imageProps.imagePath, " => ", newPath);

        await renamePromise(imageProps.imagePath, newPath);

        return true;
    }

    function getLocation(
        imageProps: ImageProperties,
        mapDateToLocationManager: MapDateToLocationManager,
        outputter: IOutputter
    ): string | null {
        // prefer geo-coding if available:
        if (imageProps.location && imageProps.location.completionScore > 0) {
            return imageProps.location.toString();
        }

        const location = mapDateToLocationManager.getLocationForFile(
            imageProps.imagePath,
            outputter
        );
        return location;
    }
}
