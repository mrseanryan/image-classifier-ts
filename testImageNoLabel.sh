#!/usr/bin/env bash

# Test with an image that Google cannot (confidently) label

yarn build:minimal && ./go.sh "static/testData/cannotLabel" $TMP/image-classifer-ts -replaceOnMove

./restoreTestData.sh
