import camelCase from "lodash.camelcase";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";

const pkg = require("./package.json");

const libraryName = "image-classifier-ts";

export default {
    input: `src/${libraryName}.ts`,
    output: [
        // umd = node OR browser
        { file: pkg.main, name: camelCase(libraryName), format: "umd", sourcemap: false }
        // { file: pkg.module, format: "es", sourcemap: true }
    ],
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [
        "@google-cloud/vision",
        // note: rollup chokes on sharp (C++ ?)
        "sharp"
    ],
    watch: {
        include: "src/**"
    },
    plugins: [
        // Allow json resolution
        json(),
        // Compile TypeScript files
        typescript({ useTsconfigDeclarationDir: true }),
        // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
        commonjs(),
        // Allow node_modules resolution, so you can use 'external' to control
        // which external modules to include in the bundle
        // https://github.com/rollup/rollup-plugin-node-resolve#usage
        resolve(),

        // Resolve source maps to the original source
        sourceMaps()
    ]
};
