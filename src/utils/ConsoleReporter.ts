import { ImageProperties } from "../model/ImageProperties";

export namespace ConsoleReporter {
    export function report(properties: ImageProperties) {
        console.log(`results for ${properties.imageFilename}`);
        write("file path", properties.imagePath);
        write("top labels", properties.topLabels.join(", "));
        write("file size", properties.fileSizeMbText);
        write("last modified", properties.modificationDate.toString());
        write("exif", "---");
        properties.exif.dump();
        console.log("");
    }

    function write(description: string, value: string) {
        console.log(`  ${description}:`, value);
    }
}
