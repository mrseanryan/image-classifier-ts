import * as fs from "fs";
import * as path from "path";

import { FileUtils } from "./FileUtils";
import { SimpleDate } from "./SimpleDate";

const DATE_MAP_CSV_FILENAME = "mapDateToLocation.csv";

export class MapDateToLocation {
    static parseFromCsv(pathToDirectory: string): MapDateToLocation {
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
                const simpleStartDate = SimpleDate.parse(columns[column++]);
                const simpleEndDate = SimpleDate.parse(columns[column++]);

                let date = simpleStartDate;

                const location = columns[column++];

                while (date.isLessThanOrEqual(simpleEndDate)) {
                    map.addLocationForDate(date, location);
                    date = date.nextDay();
                }
            });

        return map;
    }

    private static isComment(line: string): boolean {
        return line.startsWith("#");
    }

    private mapDateToLocation = new Map<string, string>();

    private addLocationForDate(date: SimpleDate, location: string) {
        if (this.mapDateToLocation.has(date.toString())) {
            throw new Error(`Already have an entry for date ${date.toString()}`);
        }

        if (!location || location.length === 0) {
            throw new Error(`No location set for date ${date.toString()}`);
        }

        this.mapDateToLocation.set(date.toString(), location);
    }

    getLocationForDate(date: SimpleDate): string | null {
        if (this.mapDateToLocation.has(date.toString())) {
            return this.mapDateToLocation.get(date.toString())!;
        }

        return null;
    }

    getLocationForFile(filepath: string): string | null {
        const modified = FileUtils.getModificationDateOfFile(filepath);

        const location = this.getLocationForDate(modified);
        console.log(`  location for file - date ${modified.toString()} = '${location}'`);

        return location;
    }

    setLocationForDate(date: SimpleDate, location: string) {
        this.mapDateToLocation.set(date.toString(), location);
    }
}
