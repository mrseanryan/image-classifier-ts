import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

import { ImageProperties } from "./model/ImageProperties";
import { FileFormatToken, FilenameGenerator, FileNameTokens } from "./utils/FilenameGenerator";
import { FileUtils } from "./utils/FileUtils";
import { DEFAULT_LOCATION, MapDateToLocation } from "./utils/MapDateToLocation";

const renamePromise = promisify(fs.rename);

export namespace ImageMover {
    export async function move(
        imageProps: ImageProperties,
        filenameFormat: string,
        imageOutputDir: string
    ): Promise<void> {
        const tokens: FileNameTokens = new Map<FileFormatToken, string>();
        {
            const filename = path.basename(imageProps.imagePath);
            tokens.set(FileFormatToken.Filename, filename);
            tokens.set(FileFormatToken.TopLabel, imageProps.topLabel);
            tokens.set(FileFormatToken.CombinedLabels, imageProps.topLabels.join("_"));
            tokens.set(FileFormatToken.Year, imageProps.modificationDate.year.toString());
        }

        const mapDateToLocation = MapDateToLocation.parseFromCsv(
            path.dirname(imageProps.imagePath)
        );

        tokens.set(
            FileFormatToken.Location,
            mapDateToLocation.getLocationForFile(imageProps.imagePath) || DEFAULT_LOCATION
        );

        const newFilename = FilenameGenerator.generateFilename(tokens, filenameFormat);

        const subDir = path.dirname(newFilename);
        FileUtils.ensureSubDirsExist(imageOutputDir, subDir);

        const newPath = path.join(imageOutputDir, newFilename);

        console.log("moving image ", imageProps.imagePath, " => ", newPath);

        return renamePromise(imageProps.imagePath, newPath);
    }
}
