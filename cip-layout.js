/**
 * Wrapper object for a CIP layout. Abstracts away the lookup of field names etc.
 * @constructor
 * @param {CIPClient} cip - The parent CIP client.
 * @param {array} fields - An array of field definitions
 */
function CIPLayout(cip, fields) {
    this.cip = cip;
    this.fields = fields;
    
    // TODO: Cache
    
    /**
     * Look up a field name given a key.
     * @param {string} key - The key to search for
     * @return {string} The name belonging to the specified key, or undefined if the key could not be found.
     */
    this.lookup_field = function (key) {
        for (var i = 0; i < fields.length; i++) {
            if (this.fields[i].key === key) {
                return this.fields[i];
            }
        }
        
        // If we didn't find the field, (explicitly) return undefined :(
        return undefined;
    };
}