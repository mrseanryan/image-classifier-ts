export type Args = {
    imageInputDir: string;
    imageOutputDir: string;
    options: Options;
};

export type Options = {
    dryRun: boolean;
    filenameFormat: string;
    geoLocate: boolean;
    minScore: number;
    topNLabels: number;
};
