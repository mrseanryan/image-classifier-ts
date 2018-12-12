import { ConsoleOutputter } from "./ConsoleOutputter";
import { IOutputter } from "./IOutputter";
import { NullOutputter } from "./NullOutputter";
import { Verbosity } from "./Verbosity";

export namespace OutputterFactory {
    export function create(verbosity: Verbosity): IOutputter {
        return new ConsoleOutputter(verbosity);
    }

    export function createNull(): IOutputter {
        return new NullOutputter();
    }
}
