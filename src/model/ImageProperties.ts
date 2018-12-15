import * as path from "path";

import { ExifTagSet } from "../utils/ExifUtils";
import { FileUtils } from "../utils/FileUtils";
import { IOutputter } from "../utils/output/IOutputter";
import { SimpleDate } from "../utils/SimpleDate";
import { Dimensions } from "./Dimensions";
import { ImageLocation } from "./ImageLocation";

// immutable object!
export class ImageProperties {
    static withFileSizeMb(properties: ImageProperties, fileSizeMb: number): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            properties.topLabels,
            properties.exif,
            properties.dimensions,
            fileSizeMb,
            properties.location
        );
    }

    static withLocation(properties: ImageProperties, location: ImageLocation): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            properties.topLabels,
            properties.exif,
            properties.dimensions,
            properties.fileSizeMb,
            location
        );
    }

    static withTopLabels(properties: ImageProperties, topLabels: string[]): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            topLabels,
            properties.exif,
            properties.dimensions,
            properties.fileSizeMb,
            properties.location
        );
    }

    constructor(
        readonly imagePath: string,
        readonly topLabels: string[] = [],
        readonly exif: ExifTagSet = new ExifTagSet(),
        readonly dimensions: Dimensions | null = null,
        readonly fileSizeMb: number | null = null,
        readonly location: ImageLocation | null = null
    ) {}

    get fileSizeMbText(): string {
        return this.addSizeSuffix(this._getFileSizeMbText());
    }

    private _getFileSizeMbText(): string {
        if (this.fileSizeMb === null) {
            return "Unknown";
        }

        return this.roundToFewPlaces(this.fileSizeMb).toString();
    }

    private roundToFewPlaces(value: number): number {
        return Math.round(value * 10) / 10;
    }

    private addSizeSuffix(value: string): string {
        return value + "Mb";
    }

    get imageFilename(): string {
        return path.basename(this.imagePath);
    }

    modificationDate(outputter: IOutputter): SimpleDate {
        return FileUtils.getModificationDateOfFile(this.imagePath, outputter);
    }

    get topLabel(): string {
        if (this.topLabels.length === 0) {
            return "";
        }

        return this.topLabels[0];
    }
}
