# :camera: image-classifier-ts readme

Command line tool to auto-classify images, renaming them with appropriate address and labels. Uses Node.js and the Google Geocoding and Vision APIs.

## status - stable

image-classifier-ts is stable, with ongoing development (tested on Windows, Ubuntu Linux) following semantic versioning.

<!-- travis disabled - this project eats too many credits! - [![Build Status](https://travis-ci.com/mrseanryan/image-classifier-ts.svg?branch=master)](https://travis-ci.com/mrseanryan/image-classifier-ts) -->

[![node](https://img.shields.io/node/v/image-classifier-ts.svg)](https://nodejs.org)

[![Dependencies](https://david-dm.org/mrseanryan/image-classifier-ts.svg)](https://david-dm.org/mrseanryan/image-classifier-ts)

[![npm Package](https://img.shields.io/npm/v/image-classifier-ts.svg?style=flat-square)](https://www.npmjs.org/package/image-classifier-ts)
[![NPM Downloads](https://img.shields.io/npm/dm/image-classifier-ts.svg)](https://npmjs.org/package/image-classifier-ts)

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K73ALBJ)

## why?

The project was started as a way to avoid depending on particular photo software such as Picasa,
and also to save time spent on sorting tons of photos!

## dependencies

-   Node 10.18.0 or higher
-   Yarn

### dependencies for Windows

We use `sharp` to resize images during processing. `sharp` requires
**[node-gyp](https://github.com/nodejs/node-gyp)** to build, so you will need to
install
[Microsoft's windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)
using this command:

```bash
npm install --global --production windows-build-tools
```

## features

-   process multiple image files and move them to a configurable folder, using a flexible filename template
-   auto classify the image using the Google Vision API
-   determine geographic location (address) of an image using the Google Geocoding API
-   the output filename can include date, dimensions, file size as well as labels and adress provided by Google
-   can take geographic locations from mobile photos and apply them to photos taken with a non-GPS device (matching by closest time for that date)
-   supports JPEG, PNG file formats

## usage - as cli (command line tool)

### 1 Configure your Google API key

see [configure Google APIs](configure-google.md).

### 2 Classify (label) your images

*note: the processed images will be moved to the output directory. so you may want to point 'input directory' to a *copy* of your images directory.*

#### 3 ways to run

You can run `image-classifier-ts` in one of three ways:

-   a) as a globally installed command line tool (this is the easiest way)
-   OR b) as an npm package inside an npm project
-   OR c) from the source code

##### a) install globally as a command line tool

`npm i -g image-classifier-ts@latest --production`

on Ubuntu, you may need administrator permissions via `sudo`:

`sudo npm i -g image-classifier-ts@latest --production`

To use:

`image-classifier-ts <path to image directory> <path to output directory> [-filenameFormat=<file name format>]`

##### OR b) from the npm package

Install inside your npm project:

`yarn add image-classifier-ts`

via bash script:

`node_modules/image-classifier-ts/dist/lib/cli.js <input directory> <output directory>`

OR via node:

`node node_modules/image-classifier-ts/dist/lib/main <input directory> <output directory>`

##### OR c) from the source code

```
yarn
```

_On Windows: use a bash shell like `git bash`._

To test your installation:

```
./test.sh
```

To classify your images:

```
./go.sh <path to image directory> <path to output directory> [-filenameFormat=<file name format>]
```

example:

```
./go.sh ../myPhotos ../myPhotos-labelled
```

To have a 'dry run' where the images are not actually moved, use the 'dryRun' option:

```
./go.sh ../myPhotos ../myPhotos-labelled -dryRun
```

To see more detailed usage info:

```
./go.sh
```

###### example:

```
./go.sh ../my-photos -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}-{width}x{height}--{filename}
```

###### advanced - specifying locations by date

You can specify locations for the photos, by date.

Do this by adding a file named `mapDateToLocation.csv` in the same folder as your images.

The approprite location description will be used when renaming the image files.

For an example, see [mapDateToLocation.csv](./static/testData/withLocation/mapDateToLocation.csv)

note: if the location is unknown, and the filename format includes `{location}`, then the image will NOT be moved.

## usage - as a library in a node based project

Install inside your npm project:

`yarn add image-classifier-ts`

Then in TypeScript, you can import the library:

```ts
import * as ic from "image-classifier-ts";
```

For a working example, see the [library test harness](./itest/testHarness/library-harness/find-images-by-label-cli/readme.md).

## sites

| site                 | URL                                               |
| -------------------- | ------------------------------------------------- |
| source code (github) | https://github.com/mrseanryan/image-classifier-ts |
| github page          | https://mrseanryan.github.io/image-classifier-ts/ |
| npm                  | https://www.npmjs.com/package/image-classifier-ts |

## developing code in _this_ repository

see the [contributing readme](CONTRIBUTING.md).

## origin

This project is based on the excellent seeder project [typescript-library-starter](https://github.com/alexjoverm/typescript-library-starter).

### libaries

**image-classifier-ts** uses the [ExifReader library](https://github.com/mattiasw/ExifReader).

### ORIGINAL readme (from the seeder project)

[see here](README.original.md)

## authors

Original work by Sean Ryan - mr.sean.ryan(at gmail.com)

## licence = MIT

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
