import * as nodeFetch from "node-fetch";

import { ImageProperties } from "../model/ImageProperties";
import { Options } from "../utils/args/Args";
import { ExifTag } from "../utils/ExifUtils";
import { MapDateToLocation } from "../utils/MapDateToLocation";
import { IOutputter } from "../utils/output/IOutputter";
import { GeoCodeResponseParser } from "./GeoCodeResponseParser";
import { EnvironmentVariables } from "../utils/EnvironmentVariables";

export namespace GeoCoder {
    export async function processImage(
        properties: ImageProperties,
        options: Options,
        autoMapDateToLocation: MapDateToLocation,
        outputter: IOutputter
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

        const newProperties = GeoCodeResponseParser.parseResponse(
            properties,
            json,
            options,
            outputter
        );

        if (newProperties.location) {
            autoMapDateToLocation.addLocationForDateAllowOverwrite(
                newProperties.modificationDate(outputter),
                newProperties.location
            );
        }

        return newProperties;
    }

    function getUrl(lat: string, long: string) {
        const apiKey = EnvironmentVariables.getApiKeyOrThrow();

        if (!apiKey) {
            throw new Error(
                `API key not found - you need to set the environment variable IMAGE_CLASSIFIER_TS_API_KEY`
            );
        }

        return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`;
    }
}
