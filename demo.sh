#!/usr/bin/env bash

TMP=./temp

TMP_SUBDIR=$TMP/image-classifer-ts

if [ -d $TMP_SUBDIR ]; then
    rm -rf $TMP_SUBDIR
fi
mkdir -p $TMP_SUBDIR

echo =============================
echo Classify, WITH location

./go.sh "static/testData/withLocation" $TMP/image-classifer-ts -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -geoCode -locationFormat={country}.{area1}.{area2}.{area3} -derivedLocationFormat={country}.{area1}.{area2}.{area3} -replaceOnMove $1

echo =============================
echo Classify remainders, that have NO location

./go.sh "static/testData/withLocation" $TMP/image-classifer-ts -filenameFormat={year}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -replaceOnMove $1

echo =============================
echo Run this script to restore the git state:
echo ./restoreTestData.sh
