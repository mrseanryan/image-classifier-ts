import * as fs from "fs";
import * as path from "path";

import { SimpleDate } from "./SimpleDate";

const exifReader = require("exifreader");

// Interesting subset of exif tags
export enum ExifTag {
    GPSDateStamp = "GPSDateStamp", // 2018:07:15
    GPSLatitudeRef = "GPSLatitudeRef", // North latitude
    GPSLatitude = "GPSLatitude", // 51.92166666666667
    GPSLongitudeRef = "GPSLongitudeRef", // East longitude
    GPSLongitude = "GPSLongitude" // 4.502777777777778
}

const KNOWN_LATITUDE_FORMAT = "North latitude";
const KNOWN_LONGITUDE_FORMAT = "East longitude";

const DUMP_INDENT = "      ";

export class ExifTagSet {
    static fromTags(tags: any): ExifTagSet {
        const interestingTags = Object.keys(ExifTag);

        const tagSet = new ExifTagSet();

        interestingTags.forEach(tag => {
            const value = tags[tag] ? tags[tag].description : null;

            if (value) {
                tagSet.map.set(tag as ExifTag, value);
            }
        });

        tagSet.dump();

        return tagSet;
    }

    private readonly map = new Map<ExifTag, string>();

    dump() {
        this.map.forEach((value, key) => {
            this.dumpTag(key, value);
        });
        console.log(`${DUMP_INDENT}lat/longs`, this.isLatLongOk() ? "[ok]" : "[unknown format]");
    }

    private dumpTag(tag: string, value: string) {
        console.log(`${DUMP_INDENT}${tag} = ${value}`);
    }

    get(tag: ExifTag): string | null {
        if (!this.map.has(tag)) {
            return null;
        }

        return this.map.get(tag)!;
    }

    getDateStamp(): SimpleDate | null {
        if (this.map.has(ExifTag.GPSDateStamp)) {
            const value = this.get(ExifTag.GPSDateStamp);
            if (!value) {
                return null;
            }

            // Y:M:D
            const parts = value.split(":");

            const parsePart = (index: number): number => {
                return parseInt(parts[index], 10);
            };

            const year = parsePart(0);
            const month = parsePart(1);
            const day = parsePart(2);

            return new SimpleDate(month, day, year);
        }

        return null;
    }

    isLatLongOk(): boolean {
        const lat = this.get(ExifTag.GPSLatitude);
        const long = this.get(ExifTag.GPSLongitude);

        return (
            lat !== undefined &&
            long !== undefined &&
            this.get(ExifTag.GPSLatitudeRef) === KNOWN_LATITUDE_FORMAT &&
            this.get(ExifTag.GPSLongitudeRef) === KNOWN_LONGITUDE_FORMAT
        );
    }
}

export namespace ExifUtils {
    export function readFile(filepath: string): ExifTagSet | null {
        if (!hasFileExif(filepath)) {
            return null;
        }

        const buffer = fs.readFileSync(filepath);

        try {
            const tags = exifReader.load(buffer.buffer);

            // The MakerNote tag can be really large. Remove it to lower memory
            // usage if you're parsing a lot of files and saving the tags.
            // tslint:disable-next-line:no-dynamic-delete
            delete tags["MakerNote"];

            return ExifTagSet.fromTags(tags);
        } catch (error) {
            console.error("exif error", filepath, error);

            throw error;
        }
    }

    function hasFileExif(filepath: string): boolean {
        const extension = path.extname(filepath).toLowerCase();

        return [".jpg", ".jpeg", ".tiff", ".tff"].includes(extension);
    }
}
