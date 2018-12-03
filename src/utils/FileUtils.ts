import * as fs from "fs";
import * as path from "path";

import { ExifUtils } from "./ExifUtils";
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

    export function getModificationDateOfFile(filepath: string): SimpleDate {
        // use date from exif if available (is less likely to change than the file stamp)
        const exifTags = ExifUtils.readFile(filepath);
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

    export function getModificationYearOfFile(filePath: string): string {
        return getModificationDateOfFile(filePath).year.toString();
    }
}
