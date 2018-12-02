import * as path from "path";

import { MapDateToLocation } from "../src/utils/MapDateToLocation";
import { SimpleDate } from "../src/utils/SimpleDate";

const PATH_TO_TEST_DATA = "./static/testData/singleWithLocation";

describe("MapDateToLocation tests", () => {
    it("should parse locations from a CSV file", () => {
        const map = MapDateToLocation.parseFromCsv(PATH_TO_TEST_DATA);

        // check some outside dates:
        expect(map.getLocationForDate(new SimpleDate(1, 1, 2018))).toBe(null);
        expect(map.getLocationForDate(new SimpleDate(7, 10, 2020))).toBe(null);

        // check the date range:
        const month = 7;
        const year = 2018;

        const checkDate = (_month: number, _day: number, _year: number) => {
            const date = new SimpleDate(_month, _day, _year);
            const actualLocation = map.getLocationForDate(date);
            const expectedLocation = "Rotterdam";
            if (actualLocation !== expectedLocation) {
                fail(
                    `expected ${actualLocation} to be ${expectedLocation} for simple date ${date}`
                );
            }
        };

        expect(map.getLocationForDate(new SimpleDate(month, 9, year))).toBe(null);
        for (let day = 10; day <= 20; day++) {
            checkDate(month, day, year);
        }
        expect(map.getLocationForDate(new SimpleDate(month, 21, year))).toBe(null);

        expect(map.getLocationForDate(new SimpleDate(2, 26, year))).toBe(null);
        // check at the end of a month:
        // 28 days in Feb in 2018
        for (let day = 27; day <= 28; day++) {
            checkDate(2, day, year);
        }
        for (let day = 1; day <= 3; day++) {
            checkDate(3, day, year);
        }
        expect(map.getLocationForDate(new SimpleDate(3, 4, year))).toBe(null);
    });

    it("should parse locations from a CSV file and apply it to a file", () => {
        const map = MapDateToLocation.parseFromCsv(PATH_TO_TEST_DATA);

        const modifiedDate = new SimpleDate(7, 15, 2018);

        const expectedLocation = "Rotterdam";

        expect(map.getLocationForDate(modifiedDate)).toBe(expectedLocation);

        const imageFilename = "2018-07-15 16.57.48.jpg";
        const actualLocation = map.getLocationForFile(path.join(PATH_TO_TEST_DATA, imageFilename));

        expect(actualLocation).toBe(expectedLocation);
    });
});
