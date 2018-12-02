import * as fs from "fs";
import * as os from "os";
import * as path from "path";

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

    export function getYearOfFile(filePath: string): string {
        return fs
            .statSync(filePath)
            .birthtime.getFullYear()
            .toString();
    }
}
