#!/bin/bash

JSDOC="jsdoc";
CLOSURE_COMPILER="closure";

grep -R TODO *

rm -rf dist
mkdir dist
rm -rf doc
mkdir doc

$JSDOC -d doc src/cip-catalog.js src/cip-table.js src/cip-layout.js src/cip-asset.js src/cip-searchresult.js src/cip.js;

cat header.txt > dist/cip.min.js;
#cat header.txt > dist/cip+natmus.min.js;
$CLOSURE_COMPILER vendor/qwest.js src/cip-common.js src/cip-catalog.js src/cip-table.js src/cip-asset.js src/cip-searchresult.js src/cip-layout.js src/cip.js vendor/zepto.min.js >> dist/cip.min.js;
#$CLOSURE_COMPILER dist/cip.min.js src/natmus.js >> dist/cip+natmus.min.js

zip -r dist/cip.js.zip doc;

cd dist
#zip cip+natmus.zip cip+natmus.min.js
zip cip+natmus.zip cip.min.js
