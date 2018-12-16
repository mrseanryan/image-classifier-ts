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

const verbosity = ic.Verbosity.Low;

const outputter = new ic.ConsoleOutputter(verbosity);

ic.DirectoryProcessor.processDirectory(icArgs, outputter)
    .then(result => {
        if (result.isOk) {
            console.log(successStyle("[success]"));

            const labelsWanted = labels.split(",");

            const imagesWanted = result.imageProperties.filter(image =>
                image.topLabels.some(top => labelsWanted.includes(top))
            );

            console.log(
                normalStyle(`Found ${imagesWanted.length} images with the labels '${labelsWanted}'`)
            );
            console.log(
                normalStyle(imagesWanted.map(i => `[${i.topLabels.join(",")}] ${i.imagePath} `))
            );
        } else {
            console.error(errorStyle("[failed]"));
        }
    })
    .catch(error => console.error(errorStyle(error)));
