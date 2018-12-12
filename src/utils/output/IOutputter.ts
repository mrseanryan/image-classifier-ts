import { Verbosity } from "./Verbosity";

export interface IOutputter {
    error(...items: any[]): void;
    errorVerbose(...items: any[]): void;
    info(...items: any[]): void;
    infoMediumVerbose(...items: any[]): void;
    infoVerbose(...items: any[]): void;
    warn(...items: any[]): void;
    warnVerbose(...items: any[]): void;

    readonly verbosity: Verbosity;
}
