import { LocationFormatToken, LocationNameGenerator } from "../geoCode/LocationNameGenerator";
import { Options } from "../utils/args/Args";
import { StringUtils } from "../utils/StringUtils";

// immutable object!
export class ImageLocation {
    static fromGivenLocation(givenLocation: string, options: Options): ImageLocation {
        return new ImageLocation("", "", "", "", options.locationFormat, givenLocation);
    }

    constructor(
        readonly country: string,
        readonly addressLevel1: string,
        readonly addressLevel2: string,
        readonly subLocality: string,
        private readonly locationFormat: string,
        // overrides the other params (from manual CSV file)
        readonly givenLocation: string | null = null
    ) {}

    get completionScore(): number {
        return [
            {
                value: this.givenLocation,
                score: 10
            },
            {
                value: this.country,
                score: 10
            },
            {
                value: this.addressLevel1,
                score: 5
            },
            {
                value: this.addressLevel2,
                score: 3
            },
            {
                value: this.subLocality,
                score: 1
            }
        ]
            .map(entry => {
                return entry.value && entry.value.length > 0 ? entry.score : 0;
            })
            .reduce((previous, current) => previous + current, 0);
    }

    toString(locationFormat: string = this.locationFormat): string {
        if (this.givenLocation) {
            return this.givenLocation.trim();
        }

        const tokens = new Map<LocationFormatToken, string>();
        tokens.set(LocationFormatToken.Country, this.cleanValue(this.country));
        tokens.set(LocationFormatToken.Area1, this.cleanValue(this.addressLevel1));
        tokens.set(LocationFormatToken.Area2, this.cleanValue(this.addressLevel2));
        tokens.set(LocationFormatToken.Area3, this.cleanValue(this.subLocality));

        return LocationNameGenerator.generate(tokens, locationFormat);
    }

    private cleanValue(value: string): string {
        return StringUtils.replaceAll(value.trim(), " ", "_");
    }
}
