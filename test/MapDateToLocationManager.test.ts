import * as path from "path";

import { ImageLocation } from "../src/model/ImageLocation";
import { DefaultArgs } from "../src/utils/args/DefaultArgs";
import { FileUtils } from "../src/utils/FileUtils";
import { MapDateToLocation } from "../src/utils/MapDateToLocation";
import { MapDateToLocationManager } from "../src/utils/MapDateToLocationManager";
import { SimpleDate } from "../src/utils/SimpleDate";
import { TestImages } from "../testUtils/TestImages";

const PATH_TO_TEST_DATA = "./static/testData/withLocation";

const modifiedDateInManualMap = new SimpleDate(7, 15, 2018);
const modifiedDateInAutoMap = new SimpleDate(7, 23, 2017);

describe("MapDateToLocationManager tests", () => {
    it("should parse locations from a manual CSV file then auto CSV file and apply to a file", () => {
        const autoMap = createAutoMapDateToLocation();
        const manualMap = MapDateToLocation.parseFromCsv(
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
            const expectedManualLocation = "Rotterdam";

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
                path.join(PATH_TO_TEST_DATA, imageFilename)
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
                const modified = FileUtils.getModificationDateOfFile(filePath);
                expect(modified!.toString()).toEqual(modifiedDateInAutoMap.toString());
            }

            const actualLocation = manager.getLocationForFile(filePath);

            // Manual map has no entry - so auto map should win,
            // to 2 components only (derivedLocationFormat)
            const expectedDerivedAutoLocation = "Italy_Roma(auto)";
            expect(actualLocation).toBe(expectedDerivedAutoLocation);
        }
    });

    function createAutoMapDateToLocation(): MapDateToLocation {
        const map = new MapDateToLocation();

        const options = DefaultArgs.getDefault().options;

        map.setLocationForDate(
            modifiedDateInAutoMap,
            new ImageLocation("Italy", "Roma(auto)", "7 steps", "", options.locationFormat)
        );

        map.setLocationForDate(
            modifiedDateInManualMap,
            new ImageLocation("France", "Paris(auto)", "10ieme", "", options.locationFormat)
        );

        return map;
    }
});
