/**
 * NatMus.js - an interface to the collections of Nationalmuseet
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 */

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
        "Danmarks Nyere Tid": "DNT",
        "Frihedsmuseet": "FHM",
        "Den Kgl. Mønt- og Medaljesamling": "KMM"
    }
};
