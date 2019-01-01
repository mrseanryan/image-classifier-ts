#!/usr/bin/env bash

yarn build:minimal && ./go.sh "static/testData" $TMP/image-classifer-ts -replaceOnMove -filenameFormat={year}/{topLabel}/{combinedLabels}-{fileSizeMb}-{width}x{height}--{filename}

./restoreTestData.sh
