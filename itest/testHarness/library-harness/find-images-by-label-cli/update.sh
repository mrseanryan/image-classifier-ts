#!/usr/bin/env bash

./clean.sh

# To update other dependencies
yarn upgrade

# NOT -D as need dependencies
yarn add image-classifier-ts@latest
