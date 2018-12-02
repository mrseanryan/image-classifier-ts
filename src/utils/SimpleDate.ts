// Simple date to the nearest day, and month is 1-based (!).
export class SimpleDate {
    static fromDate(date: Date): SimpleDate {
        const newDate = new SimpleDate(date.getMonth() + 1, date.getDate(), date.getFullYear());

        return newDate;
    }

    static parse(text: string): SimpleDate {
        const parts = text.split("/");

        const parsePart = (partIndex: number): number => {
            return parseInt(parts[partIndex], 10);
        };

        const month = parsePart(0);
        const day = parsePart(1);
        const year = parsePart(2);

        return new SimpleDate(month, day, year);
    }

    constructor(readonly month: number, readonly day: number, readonly year: number) {}

    isLessThanOrEqual(other: SimpleDate): boolean {
        const thisDate = this.toDate();
        const otherDate = other.toDate();

        return thisDate <= otherDate;
    }

    nextDay(): SimpleDate {
        const thisDate = this.toDate();

        const nextDate = new Date(this.year, this.month - 1, this.day);
        nextDate.setDate(thisDate.getDate() + 1);

        const next = SimpleDate.fromDate(nextDate);

        return next;
    }

    private toDate(): Date {
        return new Date(this.year, this.month - 1, this.day);
    }

    // US date format
    toString(): string {
        return `${this.month}/${this.day}/${this.year}`;
    }
}
