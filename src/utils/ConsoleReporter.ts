import { ImageProperties } from "../model/ImageProperties";
import { IOutputter } from "./output/IOutputter";

export namespace ConsoleReporter {
    export function report(properties: ImageProperties, outputter: IOutputter) {
        outputter.infoMediumVerbose(`results for ${properties.imageFilename}`);
        write("file path", properties.imagePath, outputter);
        write("top labels", properties.topLabels.join(", "), outputter);
        write("file size", properties.fileSizeMbText, outputter);
        write("last modified", properties.modificationDate.toString(), outputter);
        if (properties.location) {
            write("geo location", properties.location.toString(), outputter);
        }
        write("exif", "---", outputter);
        properties.exif.dump(outputter);
        outputter.infoMediumVerbose("");
    }

    function write(description: string, value: string, outputter: IOutputter) {
        outputter.infoMediumVerbose(`  ${description}:`, value);
    }
}
