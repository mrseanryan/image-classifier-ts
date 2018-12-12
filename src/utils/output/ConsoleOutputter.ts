import { IOutputter } from "./IOutputter";
import { Verbosity } from "./Verbosity";

export class ConsoleOutputter implements IOutputter {
    constructor(readonly verbosity: Verbosity) {}

    error(...items: any[]): void {
        console.error(...items);
    }

    errorVerbose(...items: any[]): void {
        if (this.isAllowed(Verbosity.High)) {
            console.error(...items);
        }
    }

    info(...items: any[]): void {
        console.log(...items);
    }

    infoMediumVerbose(...items: any[]): void {
        if (this.isAllowed(Verbosity.Medium)) {
            console.log(...items);
        }
    }

    infoVerbose(...items: any[]): void {
        if (this.isAllowed(Verbosity.High)) {
            console.log(...items);
        }
    }

    warn(...items: any[]): void {
        console.warn(...items);
    }

    warnVerbose(...items: any[]): void {
        if (this.isAllowed(Verbosity.High)) {
            console.warn(...items);
        }
    }

    private isAllowed(verbosity: Verbosity): boolean {
        return verbosity <= this.verbosity;
    }
}
