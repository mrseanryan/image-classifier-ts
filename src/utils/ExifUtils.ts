import * as fs from "fs";
import * as path from "path";

import { IOutputter } from "./output/IOutputter";
import { Verbosity } from "./output/Verbosity";
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
    static fromTags(tags: any, outputter: IOutputter): ExifTagSet {
        const interestingTags = Object.keys(ExifTag);

        const tagSet = new ExifTagSet();

        interestingTags.forEach(tag => {
            const value = tags[tag] ? tags[tag].description : null;

            if (value) {
                tagSet.map.set(tag as ExifTag, value);
            }
        });

        if (outputter.verbosity === Verbosity.High) {
            tagSet.dump(outputter);
        }

        return tagSet;
    }

    private readonly map = new Map<ExifTag, string>();

    dump(outputter: IOutputter) {
        this.map.forEach((value, key) => {
            this.dumpTag(key, value, outputter);
        });
        outputter.infoMediumVerbose(
            `${DUMP_INDENT}lat/longs`,
            this.isLatLongOk() ? "[ok]" : "[unknown format]"
        );
    }

    private dumpTag(tag: string, value: string, outputter: IOutputter) {
        outputter.infoMediumVerbose(`${DUMP_INDENT}${tag} = ${value}`);
    }

    get(tag: ExifTag): string | null {
        if (!this.map.has(tag)) {
            return null;
        }

        return this.map.get(tag)!;
    }

    getDateStamp(): SimpleDate | null {
        // issue: some images have valid DateTime, but GPSDateStamp is in the future!
        // so, parse both and try to pick the best one:
        const dates = this.getAvailableDateStamps();

        const now = new Date();
        const nowSimple = SimpleDate.fromDate(now);

        const validDates = dates.filter(d => d.year <= nowSimple.year && d.year > 1970);

        return validDates[0] || null;
    }

    private getAvailableDateStamps(): SimpleDate[] {
        return [
            this.tryGetExifDateStamp(ExifTag.GPSDateStamp),
            this.tryGetExifDateStamp(ExifTag.DateTime)
        ].filter(d => !!d) as SimpleDate[];
    }

    private tryGetExifDateStamp(tag: ExifTag): SimpleDate | null {
        const dateValueYMD = this.tryGet(tag);

        if (!dateValueYMD) {
            return null;
        }

        // 'Y:M:D' OR 'Y:M:D H:M:S'
        return SimpleDate.parseFromExifDate(dateValueYMD);
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
    export function readFile(filepath: string, outputter: IOutputter): ExifTagSet | null {
        if (!hasFileExif(filepath)) {
            return null;
        }

        const buffer = fs.readFileSync(filepath);

        try {
            const tags = exifReader.load(buffer.buffer);

            deleteUnusedTags(tags);

            return ExifTagSet.fromTags(tags, outputter);
        } catch (error) {
            if (error.name === "MetadataMissingError") {
                return null;
            }

            outputter.error("exif error", filepath, error);

            throw error;
        }
    }

    const DELETED = {};

    function deleteUnusedTags(tags: any) {
        // The MakerNote tag can be really large. Remove it to lower memory
        // usage if you're parsing a lot of files and saving the tags.
        tags["MakerNote"] = DELETED;

        // also delete any props that start with 'undefined-
        Object.keys(tags)
            .filter(t => t.startsWith("undefined"))
            .forEach(t => {
                tags[t] = DELETED;
            });
    }

    function hasFileExif(filepath: string): boolean {
        const extension = path.extname(filepath).toLowerCase();

        // ExifReader supports JPEG.
        // note: some PNG files can have some EXIF data but it's not yet standard.

        return [".jpg", ".jpeg"].includes(extension);
    }
}
