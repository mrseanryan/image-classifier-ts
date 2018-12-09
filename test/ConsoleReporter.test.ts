import { ImageProperties } from "../src/model/ImageProperties";
import { ConsoleReporter } from "../src/utils/ConsoleReporter";

describe("ConsoleReporter tests", () => {
    it("it should report an properties of an image", () => {
        const properties = new ImageProperties(
            "static/testData/single/P1000935-fullmar_800x600.JPG"
        );

        ConsoleReporter.report(properties);
    });
});
