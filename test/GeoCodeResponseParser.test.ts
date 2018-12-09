import { GeoCodeResponseParser } from "../src/geoCode/GeoCodeResponseParser";
import { GeoCoderTestData } from "../testUtils/GeoCoderTestData";
import { TestImages } from "../testUtils/TestImages";

describe("GeoCodeResponseParser tests", () => {
    it("should parse response from Google Geocoding servier", () => {
        const response = GeoCoderTestData.ROTTERDAM_LOCATION;

        const properties = TestImages.getTestImageProperties();

        const newProperties = GeoCodeResponseParser.parseResponse(properties, response);

        expect(newProperties.location).toEqual({
            country: "NL",
            // administrative_area_level_1
            addressLevel1: "Zuid-Holland",
            // administrative_area_level_2
            addressLevel2: "Rotterdam",
            // sublocality_level_1
            subLocality: "Kralingen - Crooswijk"
        });

        expect(newProperties.location!.toString()).toEqual(
            "NL_Zuid-Holland_Rotterdam_Kralingen_-_Crooswijk"
        );
    });
});
