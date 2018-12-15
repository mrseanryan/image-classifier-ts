import * as sizeOf from "image-size";

import { Dimensions } from "../model/Dimensions";

export namespace ImageDimensions {
    export function getDimensions(path: string): Dimensions {
        return sizeOf(path);
    }
}
