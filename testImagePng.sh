#!/usr/bin/env bash

# Test with PNG images

TMP=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

yarn build:minimal && ./go.sh "static/testData/png" $TMP/image-classifer-ts -replaceOnMove $1 $2 $3

./restoreTestData.sh
