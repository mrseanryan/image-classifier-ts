#!/usr/bin/env bash

yarn build:minimal && ./go.sh "static/testData/withLocation" $TMP/image-classifer-ts -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -geoCode

./restoreTestData.sh
