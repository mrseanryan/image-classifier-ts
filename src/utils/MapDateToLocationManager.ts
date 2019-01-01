import * as path from "path";

import { Options } from "./args/Args";
import { AUTO_DATE_MAP_CSV_FILENAME, MapDateToLocation } from "./MapDateToLocation";
import { IOutputter } from "./output/IOutputter";

export class MapDateToLocationManager {
    static fromImageDirectory(imageDir: string, options: Options) {
        return new MapDateToLocationManager(
            MapDateToLocation.parseFromCsvAtDirectory(imageDir, options),
            new MapDateToLocation(),
            options
        );
    }

    constructor(
        readonly manualMap: MapDateToLocation,
        readonly autoMap: MapDateToLocation,
        readonly options: Options
    ) {}

    /**
     * Dump the auto generated map from date to location (via exit lat/longs) to disk.
     * This is mainly for diagnostics, and to allow user to tune their manual file 'mapDateToLocation.csv'.
     */
    dumpAutoMapToDisk(imageDir: string): string {
        const filePath = path.join(imageDir, AUTO_DATE_MAP_CSV_FILENAME);
        this.autoMap.removeFromDisk(filePath);
        this.autoMap.writeToCsvAtPath(filePath);

        return filePath;
    }

    getLocationForFile(filepath: string, outputter: IOutputter): string | null {
        // manual file takes priority (to let user adjust)
        const manualLocation = this.manualMap.getLocationForFile(filepath, outputter);
        if (manualLocation) {
            return manualLocation.toString();
        }

        const autoLocation = this.autoMap.getLocationForFile(filepath, outputter);

        if (autoLocation) {
            // Use a separate (usually less specific) format for derived location,
            // since it is less accurate:
            return autoLocation.toString(this.options.derivedLocationFormat);
        }

        return null;
    }
}
