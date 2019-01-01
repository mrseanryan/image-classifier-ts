#!/usr/bin/env bash

# Test with an image that Google cannot (confidently) label

TMP=`mktemp -d 2>/dev/null || mktemp -d -t 'temp'`

yarn build:minimal && ./go.sh "static/testData/cannotLabel" $TMP/image-classifer-ts -replaceOnMove

./restoreTestData.sh
