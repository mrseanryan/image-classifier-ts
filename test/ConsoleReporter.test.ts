import { ConsoleReporter } from "../src/utils/ConsoleReporter";
import { OutputterFactory } from "../src/utils/output/OutputterFactory";
import { TestImages } from "../testUtils/TestImages";

describe("ConsoleReporter tests", () => {
    const outputter = OutputterFactory.createNull();

    it("it should report an properties of an image", () => {
        ConsoleReporter.report(TestImages.getTestImageProperties(), outputter);
    });
});
