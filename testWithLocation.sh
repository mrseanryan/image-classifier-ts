#!/usr/bin/env bash

TMP=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

yarn build:minimal && ./go.sh static/testData/withLocation $TMP/image-classifer-ts -filenameFormat={year}/{location}/{topLabel}/{combinedLabels}-{fileSizeMb}--{filename} -replaceOnMove

./restoreTestData.sh
