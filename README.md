# :camera: image-classifier-ts readme

Command line tool to auto-classify images, renaming them with appropriate labels. Uses Node.js and the Google Geolocation and Vision APIs.

## status - stable

image-classifier-ts is stable, with ongoing development (Linux, Mac, Windows) following semantic versioning.

[![Travis](https://img.shields.io/travis/mrseanryan/image-classifier-ts.svg)](https://travis-ci.org/mrseanryan/image-classifier-ts)

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
-   auto classify the image using the Google Vision API
-   determine geographic location using the Google Geolocation API
-   the output filename can include date, dimensions, file size as well as labels given by Google
-   can take geographic location from mobile photos and apply them to photos without a GPS device (matching by date)

## usage

### 1 Install dependencies

Install:

-   Yarn
-   Node 8.3.11 (or higher)

```
yarn
```

### 2 Configure your Google API key

see [configure Google APIs](configure-google.md).

### 3 Classify your images

*note: the processed images will be moved to the output directory. so you may want to point 'input directory' to a *copy* of your images directory.*

#### from the npm package

Inside your npm project:

`yarn add image-classifier-ts`

`node node_modules/image-classifier-ts/dist/lib/main <input directory> <output directory>`

#### from the source code

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

##### example:

```
./go.sh ../my-photos -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename}
```

##### advanced - specifying locations by date

You can specify locations for the photos, by date.

Do this by adding a file named `mapDateToLocation.csv` in the same folder as your images.

The approprite location description will be used when renaming the image files.

For an example, see [mapDateToLocation.csv](./static/testData/withLocation/mapDateToLocation.csv)

note: if the location is unknown, and the filename format includes `{location}`, then the image will NOT be moved.

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
