import { pathExists } from "fs-extra";
import * as path from "path";

import { ExifTagSet } from "../utils/ExifUtils";
import { FileUtils } from "../utils/FileUtils";
import { SimpleDate } from "../utils/SimpleDate";

// immutable object!
export class ImageProperties {
    static withFileSizeMb(properties: ImageProperties, fileSizeMb: number): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            properties.topLabels,
            properties.exif,
            fileSizeMb
        );
    }

    static withTopLabels(properties: ImageProperties, topLabels: string[]): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            topLabels,
            properties.exif,
            properties.fileSizeMb
        );
    }

    constructor(
        readonly imagePath: string,
        readonly topLabels: string[] = [],
        readonly exif: ExifTagSet = new ExifTagSet(),
        readonly fileSizeMb: number | null = null
    ) {}

    get fileSizeMbText(): string {
        if (this.fileSizeMb === null) {
            return "(unknown)";
        }

        return this.roundToFewPlaces(this.fileSizeMb).toString();
    }

    private roundToFewPlaces(value: number): number {
        return Math.round(value / 100) * 100;
    }
    get imageFilename(): string {
        return path.basename(this.imagePath);
    }

    get modificationDate(): SimpleDate {
        return FileUtils.getModificationDateOfFile(this.imagePath);
    }

    get topLabel(): string {
        if (this.topLabels.length === 0) {
            return "";
        }

        return this.topLabels[0];
    }
}
