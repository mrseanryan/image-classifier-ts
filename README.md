# :camera: image-classifier-ts readme

Command line tool to auto-classify images, renaming them with appropriate labels. Uses Node and Google Vision API.

## status - stable

image-classifier-ts is stable, with ongoing development (Linux, Mac, Windows) following semantic versioning.

[![Travis](https://img.shields.io/travis/mrseanryan/image-classifier-ts.svg)](https://travis-ci.org/mrseanryan/image-classifier-ts)
[![Coveralls](https://img.shields.io/coveralls/mrseanryan/image-classifier-ts.svg)](https://coveralls.io/github/mrseanryan/image-classifier-ts)

[![Greenkeeper badge](https://badges.greenkeeper.io/mrseanryan/image-classifier-ts.svg)](https://greenkeeper.io/)
[![Dev Dependencies](https://david-dm.org/mrseanryan/image-classifier-ts/dev-status.svg)](https://david-dm.org/mrseanryan/image-classifier-ts?type=dev)

[![npm Package](https://img.shields.io/npm/v/image-classifier-ts.svg?style=flat-square)](https://www.npmjs.org/package/image-classifier-ts)
[![NPM Downloads](https://img.shields.io/npm/dm/image-classifier-ts.svg)](https://npmjs.org/package/image-classifier-ts)

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/mrseanryan)

## dependencies

-   Node 8.11.3 or higher

## features

-   process multiple image files and move them to a configurable folder, filename path
-   auto classify the image using Google Vision API
-   the output filename can include date, dimensions, file size as well as labels given by Google

## usage

### 1 Install dependencies

Install:

-   Yarn
-   Node 8.3.11 (or higher)

```
yarn
```

### 2 Configure your Google API key

see [configure Google API](configure-google.md).

### 3 Classify your images

On Windows: use a bash shell like `git bash`.

To test your installation:

```
./test.sh
```

To classify your images:

```
./go <path to image directory> <file name format>
```

To see more detailed usage info:

```
./go
```

#### example:

```
./go ../my-photos {year}/{location}/{topLabel}/{combinedLabels}--{filename}
```

#### advanced - specifying locations by date

You can specify locations for the photos, by date.

Do this by adding a file named `mapDateToLocation.csv` in the same folder as your images.

The approprite location description will be used when renaming the image files.

For an example, see [mapDateToLocation.csv](./static/testData/singleWithLocation/mapDateToLocation.csv)

note: the default for {location} is 'unknown-location'.

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

The project was started as a way to avoid depending on particular photo software such as Picasa,
and also to save time spent on sorting tons of photos!

### libaries

**image-classifier-ts** uses the [ExifReader library](https://github.com/mattiasw/ExifReader).

### ORIGINAL readme (from the seeder project)

[see here](README.original.md)

## authors

Original work by Sean Ryan - mr.sean.ryan(at gmail.com)

## licence = MIT

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
