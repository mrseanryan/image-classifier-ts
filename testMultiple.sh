#!/usr/bin/env bash

yarn build:minimal && ./go.sh "static/testData" $TMP/image-classifer-ts

./restoreTestData.sh