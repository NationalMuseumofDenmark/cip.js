#!/bin/bash

NODE="node";
JSDOC="/home/jens/node_modules/jsdoc/jsdoc.js";
CLOSURE_COMPILER="closure";

$NODE $JSDOC -d doc cip-catalog.js cip-table.js cip-layout.js cip-asset.js cip-searchresult.js cip.js natmus.js;

cat header.txt > natmus.min.js;
$CLOSURE_COMPILER qwest.js cip-common.js cip-catalog.js cip-table.js cip-layout.js cip-asset.js cip-searchresult.js cip.js natmus.js >> natmus.min.js;
