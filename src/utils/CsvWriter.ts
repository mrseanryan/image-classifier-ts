import * as fs from "fs";

const ENDLINE = "\n";

export class CsvWriter {
    constructor(private readonly filePath: string) {}

    writeRow(rows: string[]) {
        const line = rows.join(",") + ENDLINE;
        fs.appendFileSync(this.filePath, line, "utf8");
    }
}
