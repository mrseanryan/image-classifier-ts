import * as path from "path";

import { DefaultArgs } from "../src/utils/args/DefaultArgs";
import { MapDateToLocation } from "../src/utils/MapDateToLocation";
import { SimpleDate } from "../src/utils/SimpleDate";
import { TestImages } from "../testUtils/TestImages";

describe("MapDateToLocation tests", () => {
    it("should parse locations from a CSV file", () => {
        const map = MapDateToLocation.parseFromCsv(
            TestImages.PATH_TO_TEST_DATA,
            DefaultArgs.getDefault().options
        );

        // check some outside dates:
        expect(map.getLocationForDate(new SimpleDate(1, 1, 2018))).toBe(null);
        expect(map.getLocationForDate(new SimpleDate(7, 10, 2020))).toBe(null);

        const checkDate = (
            _month: number,
            _day: number,
            _year: number,
            expectedLocation: string
        ) => {
            const date = new SimpleDate(_month, _day, _year);
            const actualLocation = map.getLocationForDate(date);
            if (!actualLocation || actualLocation.toString() !== expectedLocation) {
                fail(
                    `expected ${actualLocation} to be ${expectedLocation} for simple date ${date}`
                );
            }
        };

        // check the date range:
        const month = 7;
        const year = 2018;

        expect(map.getLocationForDate(new SimpleDate(month, 9, year))).toBe(null);
        for (let day = 10; day <= 20; day++) {
            checkDate(month, day, year, "Rotterdam-July");
        }
        expect(map.getLocationForDate(new SimpleDate(month, 21, year))).toBe(null);

        expect(map.getLocationForDate(new SimpleDate(2, 26, year))).toBe(null);
        // check at the end of a month:
        // 28 days in Feb in 2018
        for (let day = 27; day <= 28; day++) {
            checkDate(2, day, year, "Rotterdam-Feb-or-Mar");
        }
        for (let day = 1; day <= 3; day++) {
            checkDate(3, day, year, "Rotterdam-Feb-or-Mar");
        }
        expect(map.getLocationForDate(new SimpleDate(3, 4, year))).toBe(null);
    });

    it("should parse locations from a manual CSV file and apply it to a file", () => {
        const map = MapDateToLocation.parseFromCsv(
            TestImages.PATH_TO_TEST_DATA,
            DefaultArgs.getDefault().options
        );

        const modifiedDate = new SimpleDate(7, 15, 2018);

        const expectedLocation = "Rotterdam-July";

        const actualDerivedLocation = map.getLocationForDate(modifiedDate);
        if (!actualDerivedLocation || actualDerivedLocation.toString() !== expectedLocation) {
            fail(`actualDerivedLocation '${actualDerivedLocation}' should be ${expectedLocation}`);
        }

        const imageFilename = TestImages.imageWithExifAndGeoLocation;
        const actualLocation = map.getLocationForFile(
            path.join(TestImages.PATH_TO_TEST_DATA, imageFilename)
        );

        if (!actualLocation || actualLocation.toString() !== expectedLocation) {
            fail(`actualLocation '${actualLocation}' should be ${expectedLocation}`);
        }
    });
});
