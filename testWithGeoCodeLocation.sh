#!/usr/bin/env bash

TMP=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

yarn build:minimal && ./go.sh "static/testData/withLocation" $TMP/image-classifer-ts -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -geoCode -locationFormat={country}.{area1}.{area2}.{area3} -derivedLocationFormat={country}.{area1} -replaceOnMove $1

./restoreTestData.sh
