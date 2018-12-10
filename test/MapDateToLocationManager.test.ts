import * as path from "path";

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
        const manualMap = MapDateToLocation.parseFromCsv(PATH_TO_TEST_DATA);

        const manager = new MapDateToLocationManager(manualMap, autoMap);

        // Test match to manual CSV file
        {
            const expectedManualLocation = "Rotterdam";

            expect(manualMap.getLocationForDate(modifiedDateInManualMap)).toBe(
                expectedManualLocation
            );

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
            const expectedAutoLocation = "Roma(auto)";

            expect(manualMap.getLocationForDate(modifiedDateInAutoMap)).toBeNull();

            expect(autoMap.getLocationForDate(modifiedDateInAutoMap)).toBe(expectedAutoLocation);

            const imageFilename = TestImages.imageWithExifNoLocation;

            const filePath = path.join(PATH_TO_TEST_DATA, imageFilename);
            {
                const modified = FileUtils.getModificationDateOfFile(filePath);
                expect(modified!.toString()).toEqual(modifiedDateInAutoMap.toString());
            }

            const actualLocation = manager.getLocationForFile(filePath);

            // Manual map has no entry - so auto map should win:
            expect(actualLocation).toBe(expectedAutoLocation);
        }
    });

    function createAutoMapDateToLocation(): MapDateToLocation {
        const map = new MapDateToLocation();

        map.setLocationForDate(modifiedDateInAutoMap, "Roma(auto)");

        map.setLocationForDate(modifiedDateInManualMap, "Paris(auto)");

        return map;
    }
});
