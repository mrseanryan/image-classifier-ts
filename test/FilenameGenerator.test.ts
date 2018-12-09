import * as path from "path";

import { FileFormatToken, FilenameGenerator, FileNameTokens } from "../src/utils/FilenameGenerator";
import { FileUtils } from "../src/utils/FileUtils";

describe("FilenameGenerator tests", () => {
    it("it should handle a complex format", () => {
        let filenameFormat = "{year}/{location}/{topLabel}/{combinedLabels}--{filename}";

        const imagePath = "./static/testData/withLocation/2018-07-15 16.57.48.jpg";

        const topDesc = "bird";
        const combinedDesc = "bird_feather_seagull";

        const originalFilename = path.basename(imagePath);

        const location = "Rotterdam";

        const tokens: FileNameTokens = new Map<FileFormatToken, string>();
        {
            tokens.set(FileFormatToken.Filename, originalFilename);
            tokens.set(FileFormatToken.TopLabel, topDesc);
            tokens.set(FileFormatToken.CombinedLabels, combinedDesc);
            tokens.set(FileFormatToken.Year, FileUtils.getModificationYearOfFile(imagePath));
            tokens.set(FileFormatToken.Location, location);
        }

        let actualNewFilename = FilenameGenerator.generateFilename(tokens, filenameFormat);

        // replace year as it will change!
        const fixedYear = "2001";
        actualNewFilename = fixedYear + actualNewFilename.substr(4);

        expect(actualNewFilename).toEqual(
            `${fixedYear}/${location}/${topDesc}/${combinedDesc}--${originalFilename}`
        );
    });
});
