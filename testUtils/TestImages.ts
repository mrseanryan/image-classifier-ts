import { ImageProperties } from "../src/model/ImageProperties";

export namespace TestImages {
    export function getTestImageProperties(): ImageProperties {
        const properties = new ImageProperties(
            "static/testData/single/P1000935-fullmar_800x600.JPG"
        );

        return properties;
    }
}
