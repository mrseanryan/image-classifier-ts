#!/usr/bin/env bash

image-classifier-ts ../../../static/testData/withLocation $TMP/image-classifer-ts -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -geoCode -locationFormat={country}.{area1}.{area2}.{area3} -derivedLocationFormat={country}.{area1} -replaceOnMove

./restoreTestData.sh
