import * as fs from "fs";
import * as path from "path";

import { ExifUtils } from "./ExifUtils";
import { IOutputter } from "./output/IOutputter";
import { SimpleDate } from "./SimpleDate";

export namespace FileUtils {
    export function ensureDirExists(dirPath: string) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    }

    export function ensureSubDirsExist(outDir: string, subDirPath: string) {
        const subDirs = subDirPath.split("/");

        ensureDirExists(outDir);

        let dirPath = outDir;
        subDirs.forEach(s => {
            dirPath = path.join(dirPath, s);
            ensureDirExists(dirPath);
        });
    }

    export function getModificationDateOfFile(filepath: string, outputter: IOutputter): SimpleDate {
        // use date from exif if available (is less likely to change than the file stamp)
        const exifTags = ExifUtils.readFile(filepath, outputter);
        if (exifTags) {
            const exifDate = exifTags.getDateStamp();
            if (exifDate) {
                return exifDate;
            }
        }

        // fallback:
        const fileCreatedDate = fs.statSync(filepath).mtime;
        return SimpleDate.fromDate(fileCreatedDate);
    }

    export function getModificationYearOfFile(filePath: string, outputter: IOutputter): string {
        return getModificationDateOfFile(filePath, outputter).year.toString();
    }
}
