import { Verbosity } from "../output/Verbosity";
import { Args } from "./Args";
import { DefaultArgs } from "./DefaultArgs";
import { UsageText } from "./UsageText";

const NUM_MANDATORY_ARGS = 4;

class HelpNeededError extends Error {
    readonly name = "HelpNeededError";
}

export namespace ArgsParser {
    export function getArgs(): Args | null {
        try {
            const args: Args = DefaultArgs.getDefault();

            if (process.argv.length < NUM_MANDATORY_ARGS) {
                throw new HelpNeededError("Incorrect arguments");
            }
            updateConfigFromArgs(args);

            updateConfigFromOptionalArgs(args);

            return args;
        } catch (error) {
            if (error.name === "HelpNeededError") {
                UsageText.showUsage();
                return null;
            }

            console.error(error);
            return null;
        }
    }

    function updateConfigFromArgs(args: Args) {
        args.imageInputDir = process.argv[2];
        args.imageOutputDir = process.argv[3];
    }

    function updateConfigFromOptionalArgs(args: Args) {
        for (let i = NUM_MANDATORY_ARGS; i < process.argv.length; i++) {
            const optionArg = process.argv[i];

            const optionParts = optionArg.split("=");
            const option = optionParts[0].trim();

            let value = optionParts.length > 1 ? optionParts[1].trim() : null;

            const assertHasValue = (message: string): string => {
                if (!value) {
                    throw new Error(message);
                }
                return value;
            };

            const assertHasNumericValue = (message: string, min: number, max: number): number => {
                const textValue = assertHasValue(message);

                const numberValue = Number.parseInt(textValue, 10);

                if (!isFinite(numberValue)) {
                    throw new Error(message);
                }

                if (numberValue < min || numberValue > max) {
                    throw new Error(message);
                }

                return numberValue;
            };

            switch (option) {
                case "-derivedLocationFormat":
                    args.options.derivedLocationFormat = assertHasValue(
                        "derivedLocationFormat must have a value, like derivedLocationFormat={country}_{area1}_{area2}_{area3}"
                    );
                    break;
                case "-dryRun":
                    args.options.dryRun = true;
                    break;
                case "-filenameFormat":
                    args.options.filenameFormat = assertHasValue(
                        "filenameFormat must have a value, like filenameFormat={year}/{topLabel}/{combinedLabels}--{filename}"
                    );
                    break;
                case "-h":
                case "-help":
                    throw new HelpNeededError();
                case "-geoCode":
                    args.options.geoCode = true;
                    break;
                case "-locationFormat":
                    args.options.locationFormat = assertHasValue(
                        "locationFormat must have a value, like locationFormat={country}_{area1}_{area2}_{area3}"
                    );
                    break;
                case "-minScore":
                    args.options.minScore = assertHasNumericValue(
                        "minScore must have a value, like: minScore=0.8",
                        0,
                        1
                    );
                    break;
                case "-replaceOnMove":
                    args.options.replaceOnMove = true;
                    break;
                case "-topNLabels":
                    args.options.topNLabels = assertHasNumericValue(
                        "topNLabels must have a value, like: topNLabels=2",
                        1,
                        10
                    );
                    break;
                case "-verbosity":
                    const verbosityNumber = assertHasNumericValue(
                        "verbosity must have a value (1-3), like: verbosity=2",
                        1,
                        3
                    );
                    args.options.verbosity = verbosityNumber;
                    break;
                case "":
                    break;
                default:
                    throw new Error(`unrecognised option ${optionArg}`);
            }
        }
    }
}
