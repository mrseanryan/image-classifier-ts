#!/usr/bin/env bash

yarn build

ROOT=../../../..

node ./dist/cli.js $ROOT/static/testData/withLocation bird,flower

./restoreTestData.sh
