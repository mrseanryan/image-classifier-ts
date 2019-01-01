import { SimpleDate } from "../src/utils/SimpleDate";

describe("SimpleDate tests", () => {
    it("it should dump to string with 2 digits for time parts", () => {
        const date = new SimpleDate(7, 31, 1918, 1, 2, 3);

        expect(date.toString()).toEqual("7/31/1918T01:02:03");
    });
});
