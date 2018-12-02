#!/usr/bin/env bash

yarn build:minimal && ./go.sh "static/testData/singleWithLocation" $TMP/image-classifer-ts {year}/{location}/{topLabel}/{combinedLabels}--{filename}

./restoreTestData.sh
