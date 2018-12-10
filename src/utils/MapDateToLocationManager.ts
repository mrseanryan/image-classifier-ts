import * as path from "path";

import { AUTO_DATE_MAP_CSV_FILENAME, MapDateToLocation } from "./MapDateToLocation";
import { SimpleDate } from "./SimpleDate";

export class MapDateToLocationManager {
    static fromImageDirectory(imageDir: string) {
        return new MapDateToLocationManager(
            MapDateToLocation.parseFromCsv(imageDir),
            new MapDateToLocation()
        );
    }

    constructor(readonly manualMap: MapDateToLocation, readonly autoMap: MapDateToLocation) {}

    /**
     * Dump the auto generated map from date to location (via exit lat/longs) to disk.
     * This is mainly for diagnostics, and to allow user to tune their manual file 'mapDateToLocation.csv'.
     */
    dumpAutoMapToDisk(imageDir: string) {
        const filePath = path.join(imageDir, AUTO_DATE_MAP_CSV_FILENAME);
        this.autoMap.removeFromDisk(filePath);
        this.autoMap.dumpToDisk(filePath);
    }

    getLocationForDate(date: SimpleDate): string | null {
        // manual file takes priority (to let user adjust)
        return this.manualMap.getLocationForDate(date) || this.autoMap.getLocationForDate(date);
    }
    getLocationForFile(filepath: string): string | null {
        // manual file takes priority (to let user adjust)
        return (
            this.manualMap.getLocationForFile(filepath) || this.autoMap.getLocationForFile(filepath)
        );
    }
}
