#!/usr/bin/env bash

echo Running from node_modules/image-classifier-ts ...

ROOT=../../../..

./node_modules/image-classifier-ts/dist/lib/cli.js $ROOT/static/testData/withLocation $TMP/image-classifer-ts -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -geoCode -locationFormat={country}.{area1}.{area2}.{area3} -derivedLocationFormat={country}.{area1} -replaceOnMove

./restoreTestData.sh
