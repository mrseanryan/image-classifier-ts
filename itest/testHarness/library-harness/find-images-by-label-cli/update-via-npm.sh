#!/usr/bin/env bash

./clean.sh

# --production skips some compile steps of dependencies, that would require extra tools like node-gyp
npm i image-classifier-ts@latest --production
