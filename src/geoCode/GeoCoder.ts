import * as nodeFetch from "node-fetch";

import { ImageProperties } from "../model/ImageProperties";
import { Options } from "../utils/args/Args";
import { ExifTag } from "../utils/ExifUtils";
import { GeoCodeResponseParser } from "./GeoCodeResponseParser";

export namespace GeoCoder {
    export async function processImage(properties: ImageProperties): Promise<ImageProperties> {
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

        return GeoCodeResponseParser.parseResponse(properties, json);
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
