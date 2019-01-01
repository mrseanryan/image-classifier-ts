#!/usr/bin/env bash

# Test with an image that was identified as year 2038 not 2017

yarn build:minimal && ./go.sh "static/testData/year2038" $TMP/image-classifer-ts -replaceOnMove $1 $2 $3

./restoreTestData.sh
