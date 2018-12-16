import * as clc from "cli-color";
import * as ic from "image-classifier-ts";

const argv = require("yargs")
    .usage("Usage: $0 [path to image directory] [comma separated list of labels]")
    .demandCommand(2).argv;

const inputDir = argv._[0];
const labels = argv._[1];

const errorStyle = clc.black.bgRed;
const normalStyle = clc.green;
const successStyle = clc.black.bgGreen;

console.log(normalStyle(`Finding labels '${labels}' at '${inputDir}' ...`));

const icArgs: ic.Args = Object.assign(ic.DefaultArgs.getDefault(), {});

icArgs.imageInputDir = inputDir;
icArgs.options.dryRun = true;

// Medium, to see the results:
const verbosity = ic.Verbosity.Medium;

const outputter = new ic.ConsoleOutputter(verbosity);

ic.DirectoryProcessor.processDirectory(icArgs, outputter)
    .then(isOk => {
        if (isOk) {
            console.log(successStyle("[success]"));
        } else {
            console.error(errorStyle("[failed]"));
        }
    })
    .catch(error => console.error(errorStyle(error)));
