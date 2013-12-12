/**
 * NatMus.js - an interface to the collections of Nationalmuseet
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 */

// Shim to avoid failures on browsers without console.
window.console = window.console || {log: function() {}, error: function() {}};


/**
 * The Nationalmuseet object that can emit various other objects
 * related to data gathering from Nationalmuseet.
 * @constructor
 * @param {CIPClient} cip - A CIP.js client object
 */
function NatMus() {
    this.constants = {
        catch_all_alias: "any",
        layout_alias: "web"
    };
    console.log("NatMus object initialized");
    
}
