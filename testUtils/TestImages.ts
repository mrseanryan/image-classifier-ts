import { ImageProperties } from "../src/model/ImageProperties";

export namespace TestImages {
    export function getTestImageProperties(): ImageProperties {
        const properties = new ImageProperties(
            "static/testData/single/P1000935-fullmar_800x600.JPG"
        );

        return properties;
    }

    export const PATH_TO_TEST_DATA = "./static/testData/withLocation";

    export const imageWithExifAndGeoLocation = "2018-07-15 16.57.48-exif-and-geo.jpg";
    export const imageWithNoExifNoLocation = "P1000935-no-location-no-exif.JPG";
    export const imageWithExifNoLocation = "P1130761-no-location--has-exif.JPG";
}
