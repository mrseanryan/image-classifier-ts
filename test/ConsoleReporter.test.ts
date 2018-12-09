import { ConsoleReporter } from "../src/utils/ConsoleReporter";
import { TestImages } from "../testUtils/TestImages";

describe("ConsoleReporter tests", () => {
    it("it should report an properties of an image", () => {
        ConsoleReporter.report(TestImages.getTestImageProperties());
    });
});
