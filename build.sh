#!/bin/bash

NODE="node";
JSDOC="/home/jens/node_modules/jsdoc/jsdoc.js";
CLOSURE_COMPILER="closure";

$NODE $JSDOC -d doc lib/cip-catalog.js lib/cip-table.js lib/cip-layout.js lib/cip-asset.js lib/cip-searchresult.js lib/cip.js lib/natmus.js;

cat header.txt > lib/natmus.min.js;
$CLOSURE_COMPILER vendor/qwest.js lib/cip-common.js lib/cip-catalog.js lib/cip-table.js lib/cip-layout.js lib/cip-asset.js lib/cip-searchresult.js lib/cip.js lib/natmus.js >> build/natmus.min.js;
