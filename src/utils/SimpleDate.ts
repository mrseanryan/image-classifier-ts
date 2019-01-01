// Simple date to the nearest day, and month is 1-based (!).
export class SimpleDate {
    static fromDate(date: Date): SimpleDate {
        const newDate = new SimpleDate(
            date.getMonth() + 1,
            date.getDate(),
            date.getFullYear(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        );

        return newDate;
    }

    // Format: 'm/d/y' OR 'm/d/yTh:m:s'
    static parseFromMDY(text: string): SimpleDate {
        const dateAndTimeParts = text.split("T");

        const datePart = dateAndTimeParts[0];

        const parts = datePart.split("/");

        const month = SimpleDate.parsePart(parts, 0);
        const day = SimpleDate.parsePart(parts, 1);
        const year = SimpleDate.parsePart(parts, 2);

        let hour = 0;
        let minute = 0;
        let second = 0;

        if (dateAndTimeParts[1]) {
            const timePart = dateAndTimeParts[1];
            const timeParts = timePart.split(":");
            hour = SimpleDate.parsePart(timeParts, 0);
            minute = SimpleDate.parsePart(timeParts, 1);
            second = SimpleDate.parsePart(timeParts, 2);
        }

        return new SimpleDate(month, day, year, hour, minute, second);
    }

    // Format: 'Y:M:D' OR 'Y:M:D H:M:S'
    static parseFromExifDate(dateValueYMD: string): SimpleDate | null {
        const dateAndTimeParts = dateValueYMD.split(" ");

        const datePart = dateAndTimeParts[0];

        const parts = datePart.split(":");

        const year = SimpleDate.parsePart(parts, 0);
        const month = SimpleDate.parsePart(parts, 1);
        const day = SimpleDate.parsePart(parts, 2);

        let hour = 0;
        let minute = 0;
        let second = 0;

        if (dateAndTimeParts[1]) {
            const timePart = dateAndTimeParts[1];
            const timeParts = timePart.split(":");
            hour = SimpleDate.parsePart(timeParts, 0);
            minute = SimpleDate.parsePart(timeParts, 1);
            second = SimpleDate.parsePart(timeParts, 2);
        }

        return new SimpleDate(month, day, year, hour, minute, second);
    }

    private static parsePart(partArray: string[], partIndex: number): number {
        return parseInt(partArray[partIndex], 10);
    }

    constructor(
        readonly month: number,
        readonly day: number,
        readonly year: number,
        readonly hour: number = 0,
        readonly minute: number = 0,
        readonly second: number = 0
    ) {}

    isEqualTo(other: SimpleDate): boolean {
        const thisDate = this.toDate();
        const otherDate = other.toDate();

        return thisDate <= otherDate && thisDate >= otherDate;
    }

    compareTo(other: SimpleDate): number {
        const thisDate = this.toDate();
        const otherDate = other.toDate();

        return thisDate.getTime() - otherDate.getTime();
    }

    isGreaterThan(other: SimpleDate): boolean {
        const thisDate = this.toDate();
        const otherDate = other.toDate();

        return thisDate > otherDate;
    }

    isLessThan(other: SimpleDate): boolean {
        const thisDate = this.toDate();
        const otherDate = other.toDate();

        return thisDate < otherDate;
    }

    isLessThanOrEqualTo(other: SimpleDate): boolean {
        const thisDate = this.toDate();
        const otherDate = other.toDate();

        return thisDate <= otherDate;
    }

    nextDay(): SimpleDate {
        const thisDate = this.toDate();

        // time part will be 00:00:00
        const nextDate = new Date(this.year, this.month - 1, this.day);
        nextDate.setDate(thisDate.getDate() + 1);

        const next = SimpleDate.fromDate(nextDate);

        return next;
    }

    private toDate(): Date {
        return new Date(this.year, this.month - 1, this.day, this.hour, this.minute, this.second);
    }

    // US date format
    toString(): string {
        return `${this.month}/${this.day}/${this.year}T${this.asTwoDigits(
            this.hour
        )}:${this.asTwoDigits(this.minute)}:${this.asTwoDigits(this.second)}`;
    }

    private asTwoDigits(value: number): string {
        return ("0" + value).slice(-2);
    }

    toStringDateOnly(): string {
        return `${this.month}/${this.day}/${this.year}`;
    }
}
