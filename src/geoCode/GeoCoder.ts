import * as nodeFetch from "node-fetch";

import { ImageProperties } from "../model/ImageProperties";
import { Options } from "../utils/args/Args";
import { ExifTag } from "../utils/ExifUtils";
import { MapDateToLocation } from "../utils/MapDateToLocation";
import { GeoCodeResponseParser } from "./GeoCodeResponseParser";

export namespace GeoCoder {
    export async function processImage(
        properties: ImageProperties,
        options: Options,
        autoMapDateToLocation: MapDateToLocation
    ): Promise<ImageProperties> {
        if (!properties.exif.isLatLongOk()) {
            return properties;
        }

        const rsp = await nodeFetch.default(
            getUrl(
                properties.exif.get(ExifTag.GPSLatitude)!,
                properties.exif.get(ExifTag.GPSLongitude)!
            )
        );
        const json = await rsp.json();

        const newProperties = GeoCodeResponseParser.parseResponse(properties, json, options);

        if (newProperties.location) {
            // TODO - could store multiple locations per date, and match to nearest hour
            autoMapDateToLocation.setLocationForDate(
                newProperties.modificationDate,
                newProperties.location
            );
        }

        return newProperties;
    }

    function getUrl(lat: string, long: string) {
        const apiKey = process.env.IMAGE_CLASSIFIER_TS_API_KEY;

        if (!apiKey) {
            throw new Error(
                `API key not found - you need to set the environment variable IMAGE_CLASSIFIER_TS_API_KEY`
            );
        }

        return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`;
    }
}
