#!/bin/bash

NODE="node";
JSDOC="/home/jens/node_modules/jsdoc/jsdoc.js";
CLOSURE_COMPILER="closure";

rm build/cip+natmus.zip;
rm -rf doc
mkdir doc

$NODE $JSDOC -d doc lib/cip-catalog.js lib/cip-table.js lib/cip-layout.js lib/cip-asset.js lib/cip-searchresult.js lib/cip.js;

cat header.txt > lib/natmus.min.js;
$CLOSURE_COMPILER vendor/qwest.js lib/cip-common.js lib/cip-catalog.js lib/cip-table.js lib/cip-layout.js lib/cip-asset.js lib/cip-searchresult.js lib/cip.js >> build/cip.min.js;
$CLOSURE_COMPILER build/cip.min.js lib/natmus.js >> build/cip+natmus.min.js

zip -r build/cip+natmus.zip doc;

cd build
zip cip+natmus.zip cip+natmus.min.js
zip cip+natmus.zip cip.min.js
