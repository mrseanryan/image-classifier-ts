import { pathExists } from "fs-extra";
import * as path from "path";
import { stringify } from "querystring";

import { LocationFormatToken, LocationNameGenerator } from "../geoCode/LocationNameGenerator";
import { ExifTagSet } from "../utils/ExifUtils";
import { FileUtils } from "../utils/FileUtils";
import { SimpleDate } from "../utils/SimpleDate";
import { StringUtils } from "../utils/StringUtils";

// immutable object!
export class ImageLocation {
    constructor(
        readonly country: string,
        readonly addressLevel1: string,
        readonly addressLevel2: string,
        readonly subLocality: string,
        private readonly locationFormat: string
    ) {}

    get completionScore(): number {
        return [
            {
                value: this.country,
                score: 10
            },
            {
                value: this.addressLevel1,
                score: 5
            },
            {
                value: this.addressLevel2,
                score: 3
            },
            {
                value: this.subLocality,
                score: 1
            }
        ]
            .map(entry => {
                return entry.value.length > 0 ? entry.score : 0;
            })
            .reduce((previous, current) => previous + current, 0);
    }

    toString(): string {
        const tokens = new Map<LocationFormatToken, string>();
        tokens.set(LocationFormatToken.Country, this.cleanValue(this.country));
        tokens.set(LocationFormatToken.Area1, this.cleanValue(this.addressLevel1));
        tokens.set(LocationFormatToken.Area2, this.cleanValue(this.addressLevel2));
        tokens.set(LocationFormatToken.Area3, this.cleanValue(this.subLocality));

        return LocationNameGenerator.generate(tokens, this.locationFormat);
    }

    private cleanValue(value: string): string {
        return StringUtils.replaceAll(value.trim(), " ", "_");
    }
}

// immutable object!
export class ImageProperties {
    static withFileSizeMb(properties: ImageProperties, fileSizeMb: number): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            properties.topLabels,
            properties.exif,
            fileSizeMb,
            properties.location
        );
    }

    static withLocation(properties: ImageProperties, location: ImageLocation): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            properties.topLabels,
            properties.exif,
            properties.fileSizeMb,
            location
        );
    }

    static withTopLabels(properties: ImageProperties, topLabels: string[]): ImageProperties {
        return new ImageProperties(
            properties.imagePath,
            topLabels,
            properties.exif,
            properties.fileSizeMb,
            properties.location
        );
    }

    constructor(
        readonly imagePath: string,
        readonly topLabels: string[] = [],
        readonly exif: ExifTagSet = new ExifTagSet(),
        readonly fileSizeMb: number | null = null,
        // TODO xxx try to avoid modifying
        public location: ImageLocation | null = null
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
