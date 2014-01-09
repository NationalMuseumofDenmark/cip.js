#!/bin/bash

JSDOC="jsdoc";
CLOSURE_COMPILER="closure";

rm -rf build
mkdir build
rm -rf doc
mkdir doc

$JSDOC -d doc src/cip-catalog.js src/cip-table.js src/cip-layout.js src/cip-asset.js src/cip-searchresult.js src/cip.js;

cat header.txt > build/cip.min.js;
cat header.txt > build/cip+natmus.min.js;
$CLOSURE_COMPILER vendor/qwest.js src/cip-common.js src/cip-catalog.js src/cip-table.js src/cip-layout.js src/cip-asset.js src/cip-searchresult.js src/cip.js >> build/cip.min.js;
$CLOSURE_COMPILER build/cip.min.js src/natmus.js >> build/cip+natmus.min.js

zip -r build/cip+natmus.zip doc;

cd build
zip cip+natmus.zip cip+natmus.min.js
zip cip+natmus.zip cip.min.js
