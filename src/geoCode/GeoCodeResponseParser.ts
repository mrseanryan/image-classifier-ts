import { ImageLocation, ImageProperties } from "../model/ImageProperties";
import { Options } from "../utils/args/Args";

export namespace GeoCodeResponseParser {
    // exported so can unit test
    export function parseResponse(
        properties: ImageProperties,
        responseJson: any,
        options: Options
    ): ImageProperties {
        if (!responseJson) {
            console.warn("no response from geo coding service!");

            return properties;
        }

        let bestLocation = properties;

        for (const index in responseJson.results) {
            const result = responseJson.results[index];

            const newProperties = ImageProperties.withLocation(
                properties,
                new ImageLocation(
                    extractAddressComponent(result, "country", false),
                    extractAddressComponent(result, "administrative_area_level_1"),
                    extractAddressComponent(result, "administrative_area_level_2"),
                    extractAddressComponent(result, "sublocality_level_1"),
                    options.locationFormat
                )
            );

            if (
                !bestLocation.location ||
                (newProperties.location &&
                    newProperties.location.completionScore > bestLocation.location.completionScore)
            ) {
                bestLocation = newProperties;
            }
        }

        return bestLocation;
    }

    function extractAddressComponent(json: any, type: string, isLong: boolean = true): string {
        const components = json.address_components
            .filter((r: any) => r.types.some((t: any) => t === type))
            .map((r: any) => (isLong ? r.long_name : r.short_name))
            .filter((n: string) => n && n.length > 0);

        let component = "";
        if (components.length > 0) {
            component = components[0];
        }

        return component;
    }
}
