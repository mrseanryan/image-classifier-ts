import { GeoCodeResponseParser } from "../src/geoCode/GeoCodeResponseParser";
import { ImageLocation } from "../src/model/ImageLocation";
import { DefaultArgs } from "../src/utils/args/DefaultArgs";
import { OutputterFactory } from "../src/utils/output/OutputterFactory";
import { GeoCoderTestData } from "../testUtils/GeoCoderTestData";
import { TestImages } from "../testUtils/TestImages";

describe("GeoCodeResponseParser tests", () => {
    const outputter = OutputterFactory.createNull();

    it("should parse response from Google Geocoding servier", () => {
        const response = GeoCoderTestData.ROTTERDAM_LOCATION;

        const properties = TestImages.getTestImageProperties();

        const options = DefaultArgs.getDefault().options;
        Object.assign(options, {
            locationFormat: "{country}.{area1}.{area2}.{area3}"
        });

        const newProperties = GeoCodeResponseParser.parseResponse(
            properties,
            response,
            options,
            outputter
        );

        expect(newProperties.location).toEqual(
            new ImageLocation(
                "NL",
                // administrative_area_level_1
                "Zuid-Holland",
                // administrative_area_level_2
                "Rotterdam",
                // sublocality_level_1
                "Kralingen - Crooswijk",
                options.locationFormat
            )
        );

        expect(newProperties.location!.toString()).toEqual(
            "NL.Zuid-Holland.Rotterdam.Kralingen_-_Crooswijk"
        );
    });
});
