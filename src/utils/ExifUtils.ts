import * as fs from "fs";
import * as path from "path";

import { SimpleDate } from "./SimpleDate";

// To solve warning from exifreader
(global as any).DOMParser = require("xmldom").DOMParser;

const exifReader = require("exifreader");

// Interesting subset of exif tags
export enum ExifTag {
    ApertureValue = "ApertureValue", // 1.53
    ColorSpace = "ColorSpace", // sRGB
    DateTime = "DateTime", // 2018:07:15 16:57:48
    FocalLength = "FocalLength", // 4.2
    GPSAltitude = "GPSAltitude", // 51 m
    GPSAltitudeRef = "GPSAltitudeRef", // Sea level
    GPSDateStamp = "GPSDateStamp", // 2018:07:15
    GPSLatitude = "GPSLatitude", // 51.92166666666667
    GPSLatitudeRef = "GPSLatitudeRef", // North latitude
    GPSLongitude = "GPSLongitude", // 4.502777777777778
    GPSLongitudeRef = "GPSLongitudeRef", // East longitude
    ISOSpeedRatings = "ISOSpeedRatings", // 40
    Orientation = "Orientation", // right-top
    ShutterSpeedValue = "ShutterSpeedValue" // 7.05
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
        const dateValueYMD = this.tryGet(ExifTag.GPSDateStamp) || this.tryGet(ExifTag.DateTime);

        if (!dateValueYMD) {
            return null;
        }

        // Y:M:D
        const parts = dateValueYMD.split(":");

        const parsePart = (index: number): number => {
            return parseInt(parts[index], 10);
        };

        const year = parsePart(0);
        const month = parsePart(1);
        const day = parsePart(2);

        return new SimpleDate(month, day, year);
    }

    private tryGet(tag: ExifTag): string | null {
        if (this.map.has(tag)) {
            return this.get(tag);
        }
        return null;
    }

    isLatLongOk(): boolean {
        const lat = this.get(ExifTag.GPSLatitude);
        const long = this.get(ExifTag.GPSLongitude);

        return (
            lat !== null &&
            long !== null &&
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
            // TODO xxx could also delete any props that start with 'undefined-

            return ExifTagSet.fromTags(tags);
        } catch (error) {
            if (error.name === "MetadataMissingError") {
                return null;
            }

            console.error("exif error", filepath, error);

            throw error;
        }
    }

    function hasFileExif(filepath: string): boolean {
        const extension = path.extname(filepath).toLowerCase();

        return [".jpg", ".jpeg", ".tiff", ".tff"].includes(extension);
    }
}
