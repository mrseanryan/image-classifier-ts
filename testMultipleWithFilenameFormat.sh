#!/usr/bin/env bash

TMP=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

yarn build:minimal && ./go.sh "static/testData" $TMP/image-classifer-ts -replaceOnMove -filenameFormat={year}/{topLabel}/{combinedLabels}-{fileSizeMb}-{width}x{height}--{filename}

./restoreTestData.sh
