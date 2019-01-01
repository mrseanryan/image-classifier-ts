import * as os from "os";
import * as path from "path";

import { ImageLocation } from "../src/model/ImageLocation";
import { DefaultArgs } from "../src/utils/args/DefaultArgs";
import { FileUtils } from "../src/utils/FileUtils";
import { MapDateToLocation } from "../src/utils/MapDateToLocation";
import { MapDateToLocationManager } from "../src/utils/MapDateToLocationManager";
import { OutputterFactory } from "../src/utils/output/OutputterFactory";
import { SimpleDate } from "../src/utils/SimpleDate";
import { TestImages } from "../testUtils/TestImages";

const PATH_TO_TEST_DATA = "./static/testData/withLocation";

const modifiedDateInManualMap = new SimpleDate(7, 15, 2018);

// note: this matches the exif timestamp in the test image:
const modifiedDateInAutoMap = new SimpleDate(7, 23, 2017, 14, 20, 51);

const modifiedDateInAutoMapAt14h00 = new SimpleDate(7, 23, 2017, 14, 0, 0);
const modifiedDateInAutoMapAt14h15 = new SimpleDate(7, 23, 2017, 14, 15, 0);
const modifiedDateInAutoMapAt15h00 = new SimpleDate(7, 23, 2017, 15, 0, 0);

const options = DefaultArgs.getDefault().options;
const autoLocationAt14h00 = new ImageLocation(
    "Italy",
    "Roma(auto) - (at 14:00:00)",
    "7 steps",
    // by default - derived location format only includes first 2 parts
    "",
    options.locationFormat
);

const autoLocationAt14h15 = new ImageLocation(
    "Italy",
    "Roma(auto) - (at 14:15:00)",
    "Colloseum",
    "",
    options.locationFormat
);

const autoLocationAt15h00 = new ImageLocation(
    "Italy",
    "Roma(auto) - (at 15:00:00)",
    "Hippodrome",
    "",
    options.locationFormat
);

describe("MapDateToLocationManager tests", () => {
    const outputter = OutputterFactory.createNull();

    it("should parse locations from a manual CSV file then auto CSV file and apply to a file", () => {
        const autoMap = createAutoMapDateToLocation();
        const manualMap = MapDateToLocation.parseFromCsvAtDirectory(
            PATH_TO_TEST_DATA,
            DefaultArgs.getDefault().options
        );

        const manager = new MapDateToLocationManager(
            manualMap,
            autoMap,
            DefaultArgs.getDefault().options
        );

        // Test match to manual CSV file
        {
            const expectedManualLocation = "Rotterdam-July";

            const actualLocationForDate = manualMap.getLocationForDate(modifiedDateInManualMap);
            if (
                !actualLocationForDate ||
                actualLocationForDate.toString() !== expectedManualLocation
            ) {
                fail(
                    `actualLocationForDate '${actualLocationForDate}' should be ${expectedManualLocation}`
                );
            }

            expect(autoMap.getLocationForDate(modifiedDateInManualMap)).toBeTruthy();

            const imageFilename = TestImages.imageWithExifAndGeoLocation;
            const actualLocation = manager.getLocationForFile(
                path.join(PATH_TO_TEST_DATA, imageFilename),
                outputter
            );

            // The manual map takes priority:
            expect(actualLocation).toBe(expectedManualLocation);
        }

        // Test match to only the auto CSV file
        {
            const expectedAutoLocation = "Italy_Roma(auto)_7_steps_";

            expect(manualMap.getLocationForDate(modifiedDateInAutoMap)).toBeNull();

            const actualDerivedLocation = autoMap.getLocationForDate(modifiedDateInAutoMap);
            if (
                !actualDerivedLocation ||
                actualDerivedLocation.toString() !== expectedAutoLocation
            ) {
                fail(
                    `expected actualDerivedLocation '${actualDerivedLocation}' to be '${expectedAutoLocation}'`
                );
            }

            const imageFilename = TestImages.imageWithExifNoLocation;

            const filePath = path.join(PATH_TO_TEST_DATA, imageFilename);
            {
                const modified = FileUtils.getModificationDateOfFile(filePath, outputter);
                expect(modified!.toString()).toEqual(modifiedDateInAutoMap.toString());
            }

            const actualLocation = manager.getLocationForFile(filePath, outputter);

            // Manual map has no entry - so auto map should win,
            // to 2 components only (derivedLocationFormat)
            const expectedDerivedAutoLocation = "Italy_Roma(auto)";
            expect(actualLocation).toBe(expectedDerivedAutoLocation);
        }
    });

    function createAutoMapDateToLocation(): MapDateToLocation {
        const map = new MapDateToLocation();

        map.addLocationForDateAllowOverwrite(
            modifiedDateInAutoMap,
            new ImageLocation("Italy", "Roma(auto)", "7 steps", "", options.locationFormat)
        );

        map.addLocationForDateAllowOverwrite(
            modifiedDateInManualMap,
            new ImageLocation("France", "Paris(auto)", "10ieme", "", options.locationFormat)
        );

        return map;
    }

    it("should parse locations + times from a test CSV file and apply using the closest time", () => {
        const autoMap = createAutoMapDateToLocations();
        const manualMap = new MapDateToLocation();

        const manager = new MapDateToLocationManager(
            manualMap,
            autoMap,
            DefaultArgs.getDefault().options
        );

        // Test match to only the auto CSV file
        {
            const getNonGpsPhotoAt = (hour: number, minute: number, second: number): SimpleDate => {
                return new SimpleDate(
                    modifiedDateInAutoMapAt14h00.month,
                    modifiedDateInAutoMapAt14h00.day,
                    modifiedDateInAutoMapAt14h00.year,
                    hour,
                    minute,
                    second
                );
            };

            {
                const nonGpsPhotoDateAt13h57 = getNonGpsPhotoAt(13, 57, 23);

                // Manual map is empty
                expect(manualMap.getLocationForDate(nonGpsPhotoDateAt13h57)).toBeNull();

                // GPS photo date is NOT an exact match - but should still find closest match
                let closestAutoLocation = autoMap.getLocationForDate(nonGpsPhotoDateAt13h57);
                expect(closestAutoLocation).toEqual(autoLocationAt14h00);

                const nonGpsPhotoDateAt14h13 = getNonGpsPhotoAt(14, 13, 23);
                closestAutoLocation = autoMap.getLocationForDate(nonGpsPhotoDateAt14h13);
                expect(closestAutoLocation).toEqual(autoLocationAt14h15);

                const nonGpsPhotoDateAt14h20 = getNonGpsPhotoAt(14, 20, 13);
                closestAutoLocation = autoMap.getLocationForDate(nonGpsPhotoDateAt14h20);
                expect(closestAutoLocation).toEqual(autoLocationAt14h15);

                // non GPS photo with *exact* timestamp as GPS photo (unlikely, but good to cover)
                const nonGpsPhotoDateAtExactGpsTime = getNonGpsPhotoAt(
                    modifiedDateInAutoMap.hour,
                    modifiedDateInAutoMap.minute,
                    modifiedDateInAutoMap.second
                );
                closestAutoLocation = autoMap.getLocationForDate(nonGpsPhotoDateAtExactGpsTime);
                expect(closestAutoLocation).toEqual(autoLocationAt14h15);

                // non GPS photo taken *after* any GPS photo for that date
                const nonGpsPhotoDateAfterGps = getNonGpsPhotoAt(20, 15, 11);
                closestAutoLocation = autoMap.getLocationForDate(nonGpsPhotoDateAfterGps);
                expect(closestAutoLocation).toEqual(autoLocationAt15h00);
            }

            // 'Integration test' reading exif date from image
            const imageFilename = TestImages.imageWithExifNoLocation;

            const filePath = path.join(PATH_TO_TEST_DATA, imageFilename);
            {
                const modified = FileUtils.getModificationDateOfFile(filePath, outputter);
                expect(modified!.toString()).toEqual(modifiedDateInAutoMap.toString());

                expect(modified).toEqual(modifiedDateInAutoMap);
            }

            const actualLocation = manager.getLocationForFile(filePath, outputter);

            // Manual map has no entry - so auto map should win,
            // to 2 components only (derivedLocationFormat)
            const expectedDerivedAutoLocation = "Italy_Roma(auto)_-_(at_14:15:00)";
            expect(actualLocation).toBe(expectedDerivedAutoLocation);
        }
    });

    function createAutoMapDateToLocations(): MapDateToLocation {
        const map = new MapDateToLocation();

        map.addLocationForDateAllowOverwrite(modifiedDateInAutoMapAt14h00, autoLocationAt14h00);

        map.addLocationForDateAllowOverwrite(modifiedDateInAutoMapAt14h15, autoLocationAt14h15);

        map.addLocationForDateAllowOverwrite(modifiedDateInAutoMapAt15h00, autoLocationAt15h00);

        return map;
    }

    it("should dump auto map to CSV and be able to read it back", () => {
        const autoMap = createAutoMapDateToLocations();
        const manualMap = new MapDateToLocation();

        const manager = new MapDateToLocationManager(
            manualMap,
            autoMap,
            DefaultArgs.getDefault().options
        );

        const pathToCsvFile = manager.dumpAutoMapToDisk(os.tmpdir());

        const parsedMap = MapDateToLocation.parseFromCsvAtPath(pathToCsvFile, options);

        const checkDates = (date: SimpleDate) => {
            const parsedLocation = parsedMap.getLocationForDate(date);
            expect(parsedLocation).toBeTruthy();

            const autoMapLocation = autoMap.getLocationForDate(date);
            expect(autoMapLocation).toBeTruthy();

            // We don't parse the location back - so check 'given location':

            const expectedGivenLocation = autoMapLocation!.toString();

            expect(parsedLocation!.givenLocation).toEqual(expectedGivenLocation);
        };

        // Dates that should be in file:
        checkDates(modifiedDateInAutoMapAt14h00);
        checkDates(modifiedDateInAutoMapAt14h15);
        checkDates(modifiedDateInAutoMapAt15h00);

        // Dates that should NOT be in file:
        const dateNotInMap = new SimpleDate(11, 11, 1918, 11, 11, 11);
        expect(parsedMap.getLocationForDate(dateNotInMap)).toBeNull();
    });
});
