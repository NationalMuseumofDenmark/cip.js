/**
 * NatMus.js - an interface to the collections of Nationalmuseet
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 */

// Shim to avoid failures on browsers without console.
window.console = window.console || {log: function() {}, error: function() {}};


/**
 * The Nationalmuseet config for CIP.js
 */
var NatMusConfig = {
    endpoint: "http://samlinger.natmus.dk/CIP/",
    constants: {
        catch_all_alias: "any",
        layout_alias: "web"
    },
    catalog_aliases: {
        "Frihedsmuseet": "FHM"
    }
};
