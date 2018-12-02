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

    export function getModificationDateOfFile(filepath: string): Date {
        return fs.statSync(filepath).ctime;
    }

    export function getModificationYearOfFile(filePath: string): string {
        return getModificationDateOfFile(filePath)
            .getFullYear()
            .toString();
    }
}
