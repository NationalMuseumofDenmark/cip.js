/**
 * An asset in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client
 * @param {object} fields - The asset fields
 */ 
function CIPAsset(cip, fields) {
    this.cip = cip;
    this.fields = fields;    
    
    this.get_field = function(name) {
    
    };
    
    this.get_field_names = function() {
        return this.layout.get_names();
    };
    
    this.get_asset_url = function() {
        return this.cip.config.endpoint + "asset/download/FHM/" + this.fields.id;
    };
}
