import { triggerAsyncId } from "async_hooks";

import { Verbosity } from "../output/Verbosity";

export type Args = {
    imageInputDir: string;
    imageOutputDir: string;
    options: Options;
};

export type Options = {
    dryRun: boolean;
    filenameFormat: string;
    geoCode: boolean;
    locationFormat: string;
    derivedLocationFormat: string;
    minScore: number;
    replaceOnMove: boolean;
    topNLabels: number;
    verbosity: Verbosity;
};
