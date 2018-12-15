// Custom lodash like code, to avoid issues with rollup + lodash when installing globally (npm -g)
export namespace Nodash {
    export function take(arr: any[], count: number): any[] {
        const result: any[] = [];

        if (count < 0) {
            throw new Error("count must be >= 0");
        }

        for (let i = 0; i < count && i < arr.length; i++) {
            result.push(arr[i]);
        }

        return result;
    }
}
