#!/bin/bash

rm -rf public && mkdir public
cd node_modules/cesium
ant
cd ../../
cp -r ./node_modules/cesium/Build/Cesium/* ./public
find node_modules/cesium/Source -name "package.json" -type f -delete
