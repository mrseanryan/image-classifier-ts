#!/usr/bin/env bash

./clean.sh

yarn --quiet

# To update other dependencies
yarn upgrade --quiet

# NOT -D as need dependencies
yarn add image-classifier-ts@latest
