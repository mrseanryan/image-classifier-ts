import * as os from "os";

import { Args, Options } from "./Args";

export namespace DefaultArgs {
    export function getDefault(): Args {
        return {
            imageInputDir: "",
            imageOutputDir: os.tmpdir(),
            options: getDefaultOptions()
        };
    }

    function getDefaultOptions(): Options {
        return {
            derivedLocationFormat: "{country}_{area1}",
            dryRun: false,
            filenameFormat: "{year}/{topLabel}/{combinedLabels}--{filename}",
            geoCode: false,
            locationFormat: "{country}_{area1}_{area2}_{area3}",
            minScore: 0.7,
            replaceOnMove: false,
            topNLabels: 3
        };
    }
}
