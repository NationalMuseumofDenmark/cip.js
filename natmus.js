/**
 * NatMus.js - an interface to the collections of Nationalmuseet
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 */

/**
 * The Nationalmuseet object that can emit various other objects
 * related to data gathering from Nationalmuseet.
 * @constructor
 * @param {CIPClient} cip - A CIP.js client object
 */
function NatMus() {
    console.log("NatMus connection running, CIP session ID: "+this.jsessionid);
}

NatMus.prototype = {
    constants: {
        catch_all_alias: "any",
        layout_alias: "web"
    }
};
