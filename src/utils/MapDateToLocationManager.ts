import { MapDateToLocation } from "./MapDateToLocation";
import { SimpleDate } from "./SimpleDate";

export class MapDateToLocationManager {
    constructor(readonly manualMap: MapDateToLocation, readonly autoMap: MapDateToLocation) {}

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
