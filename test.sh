#!/usr/bin/env bash

yarn build:minimal && ./go.sh "static/testData/single" $TMP/image-classifer-ts -replaceOnMove

./restoreTestData.sh
