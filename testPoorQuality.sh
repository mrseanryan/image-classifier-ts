#!/usr/bin/env bash

TMP=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

yarn build:minimal && ./go.sh "static/testData/poorQuality" $TMP/image-classifer-ts -replaceOnMove

./restoreTestData.sh
