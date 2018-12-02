import * as path from "path";

import { FileFormatToken, FilenameGenerator, FileNameTokens } from "../src/utils/FilenameGenerator";
import { FileUtils } from "../src/utils/FileUtils";

describe("FilenameGenerator tests", () => {
    it("it should handle a complex format", () => {
        let filenameFormat = "{year}/{topLabel}/{combinedLabels}--{filename}";

        const imagePath = "./test.sh";

        const topDesc = "bird";
        const combinedDesc = "bird_feather_seagull";

        const originalFilename = path.basename(imagePath);

        const tokens: FileNameTokens = new Map<FileFormatToken, string>();
        {
            tokens.set(FileFormatToken.Filename, originalFilename);
            tokens.set(FileFormatToken.TopLabel, topDesc);
            tokens.set(FileFormatToken.CombinedLabels, combinedDesc);
            tokens.set(FileFormatToken.Year, FileUtils.getYearOfFile(imagePath));
        }

        let actualNewFilename = FilenameGenerator.generateFilename(tokens, filenameFormat);

        // replace year as it will change!
        const fixedYear = "2001";
        actualNewFilename = fixedYear + actualNewFilename.substr(4);

        expect(actualNewFilename).toEqual(
            `${fixedYear}/${topDesc}/${combinedDesc}--${originalFilename}`
        );
    });
});