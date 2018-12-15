import { Nodash } from "../src/utils/Nodash";

describe("Nodash tests", () => {
    it("should handle an empty array", () => {
        const empty: any[] = [];

        const actual = Nodash.take(empty, 5);
        expect(actual).toEqual([]);
    });

    it("should throw for negative count", () => {
        const empty: any[] = [];

        expect(() => Nodash.take(empty, -5)).toThrowError();
    });

    it("should return empty for zero count", () => {
        const empty: any[] = [];

        const actual = Nodash.take(empty, 0);
        expect(actual).toEqual([]);
    });

    it("should handle an empty array", () => {
        const empty: any[] = [];

        const actual = Nodash.take(empty, 5);
        expect(actual).toEqual([]);
    });

    it("should take top 5 of a numeric array", () => {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        const actual = Nodash.take(numbers, 5);
        expect(actual).toEqual([1, 2, 3, 4, 5]);
    });

    it("should take top 5 of a string array", () => {
        const strings = [
            "one",
            "two",
            "three",
            "four",
            "five",
            "six",
            "seven",
            "eight",
            "nine",
            "ten"
        ];

        const actual = Nodash.take(strings, 5);
        expect(actual).toEqual(["one", "two", "three", "four", "five"]);
    });

    it("should take all if count > array length", () => {
        const strings = ["one", "two", "three", "four", "five"];

        const actual = Nodash.take(strings, 10);
        expect(actual).toEqual(["one", "two", "three", "four", "five"]);
    });
});
