import { IOutputter } from "./IOutputter";
import { Verbosity } from "./Verbosity";

// tslint:disable:no-empty
export class NullOutputter implements IOutputter {
    error(...items: any[]): void {}
    errorVerbose(...items: any[]): void {}
    info(...items: any[]): void {}
    infoMediumVerbose(...items: any[]): void {}
    infoVerbose(...items: any[]): void {}
    warn(...items: any[]): void {}
    warnVerbose(...items: any[]): void {}

    verbosity: Verbosity = Verbosity.Low;
}
