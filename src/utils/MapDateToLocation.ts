import * as fs from "fs";
import * as path from "path";

import { ImageLocation } from "../model/ImageLocation";
import { Options } from "./args/Args";
import { CsvWriter } from "./CsvWriter";
import { FileUtils } from "./FileUtils";
import { IOutputter } from "./output/IOutputter";
import { SimpleDate } from "./SimpleDate";

const DATE_MAP_CSV_FILENAME = "mapDateToLocation.csv";

export const AUTO_DATE_MAP_CSV_FILENAME = "mapDateToLocation.auto.csv";

type DateAndLocation = {
    date: SimpleDate;
    location: ImageLocation;
};

export class MapDateToLocation {
    static parseFromCsv(pathToDirectory: string, options: Options): MapDateToLocation {
        const filepath = path.join(pathToDirectory, DATE_MAP_CSV_FILENAME);

        const map = new MapDateToLocation();

        if (!fs.existsSync(filepath)) {
            return map;
        }

        // expected format:
        //
        // # Dates are US format
        // # Start Date, End Date, Location description
        // 10/07/2018,20/07/2018,Rotterdam
        const allText = fs.readFileSync(filepath, "utf8");

        allText
            .split("\n")
            .map(l => l.trim())
            .map((l, zeroBasedLineNo) => {
                return {
                    line: l,
                    zeroBasedLineNo: zeroBasedLineNo
                };
            })
            .filter(l => !MapDateToLocation.isComment(l.line) && l.line.length > 0)
            .forEach(line => {
                const columns = line.line.split(",").map(c => c.trim());

                const expectedColumns = 3;
                if (columns.length !== expectedColumns) {
                    throw new Error(
                        `line ${line.zeroBasedLineNo +
                            1}: expected ${expectedColumns} columns but got ${columns.length}`
                    );
                }

                let column = 0;
                const simpleStartDate = SimpleDate.parseFromMDY(columns[column++]);
                const simpleEndDate = SimpleDate.parseFromMDY(columns[column++]);

                let date = simpleStartDate;

                const location = columns[column++];

                while (date.isLessThanOrEqualTo(simpleEndDate)) {
                    map.addLocationForDate(
                        date,
                        ImageLocation.fromGivenLocation(location, options)
                    );
                    date = date.nextDay();
                }
            });

        return map;
    }

    private static isComment(line: string): boolean {
        return line.startsWith("#");
    }

    private mapDateToLocations = new Map<string, DateAndLocation[]>();
    private mapExactDateToLocation = new Map<string, ImageLocation>();

    dumpToDisk(filePath: string) {
        const writer = new CsvWriter(filePath);

        this.mapDateToLocations.forEach((value, key) => {
            value.forEach(dateAndLocation => {
                writer.writeRow([
                    dateAndLocation.date.toString(),
                    dateAndLocation.location.toString()
                ]);
            });
        });
    }

    removeFromDisk(filePath: string) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    private addLocationForDate(
        date: SimpleDate,
        location: ImageLocation,
        allowOverwrite: boolean = false
    ) {
        // Dates should not be *exactly* identical
        if (this.mapExactDateToLocation.has(date.toString()) && !allowOverwrite) {
            throw new Error(`Already have an entry for date ${date.toString()}`);
        }

        if (!location || location.completionScore === 0) {
            throw new Error(`No location set for date ${date.toString()}`);
        }

        this.mapExactDateToLocation.set(date.toString(), location);

        const dateOnlyAsText = date.toStringDateOnly();
        if (!this.mapDateToLocations.has(dateOnlyAsText)) {
            this.mapDateToLocations.set(dateOnlyAsText, []);
        }

        const dateAndLocationsThisDate = this.mapDateToLocations.get(dateOnlyAsText)!;

        dateAndLocationsThisDate.push({
            date: date,
            location: location
        });

        // sort for simpler searching:
        dateAndLocationsThisDate.sort((a, b) => {
            return a.date.compareTo(b.date);
        });
    }

    addLocationForDateAllowOverwrite(date: SimpleDate, location: ImageLocation) {
        this.addLocationForDate(date, location, true);
    }

    getLocationForDate(date: SimpleDate): ImageLocation | null {
        if (this.mapExactDateToLocation.has(date.toString())) {
            return this.mapExactDateToLocation.get(date.toString())!;
        }

        if (this.mapDateToLocations.has(date.toStringDateOnly())) {
            // Use case: mobile photos with locations are mixed in with non-mobile photos,
            // and we want to match the non-mobile photos to the closest mobile ones, to use the location.
            //
            // Use exact match OR else the closest match (before or after!)
            //
            // Assumptions:
            // - photos not taken around midnight
            // - processing timezone close to the timezone of the photos
            // alt solution: use a b-tree?

            const sameDates = this.mapDateToLocations.get(date.toStringDateOnly())!;

            if (sameDates.length === 0) {
                return null;
            }

            let preceding: DateAndLocation | null = null;
            let following: DateAndLocation | null = null;

            // assumption: sameDates are sorted by time
            for (let sameDate of sameDates) {
                if (date.isGreaterThan(sameDate.date)) {
                    preceding = sameDate;
                }
                if (!following && date.isLessThan(sameDate.date)) {
                    following = sameDate;
                }

                // unlikely, but could happen
                if (sameDate.date.isEqualTo(date)) {
                    return sameDate.location;
                }

                if (following) {
                    break;
                }
            }

            if (preceding && !following) {
                return preceding.location;
            }
            if (!preceding && following) {
                return following.location;
            }

            if (preceding && following) {
                // Pick the closest:
                const timeAfterPreceding = Math.abs(date.compareTo(preceding.date));
                const timeBeforeFollowing = Math.abs(following.date.compareTo(date));

                if (timeAfterPreceding < timeBeforeFollowing) {
                    return preceding.location;
                }

                return following.location;
            }

            return null;
        }

        return null;
    }

    getLocationForFile(filepath: string, outputter: IOutputter): ImageLocation | null {
        const modified = FileUtils.getModificationDateOfFile(filepath, outputter);

        const location = this.getLocationForDate(modified);
        outputter.infoVerbose(`  location for file - date ${modified.toString()} = '${location}'`);

        return location;
    }
}
