#!/usr/bin/env bash

yarn build:minimal && ./go.sh "static/testData/singleWithLocation" $TMP/image-classifer-ts

./restoreTestData.sh
