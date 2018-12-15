import { Dimensions } from "../model/Dimensions";

const sizeOf = require("image-size");

export namespace ImageDimensions {
    export function getDimensions(path: string): Dimensions {
        return sizeOf(path);
    }
}
