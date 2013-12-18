/**
 * An asset in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client
 * @param {object} fields - The asset fields
 * @param {CIPCatalog} catalog - The catalog to which the asset belongs
 */ 
function CIPAsset(cip, fields, catalog) {
    this.cip = cip;
    this.fields = fields;
    
    this.get_field = function(name) {
    
    };
    
    this.get_field_names = function() {
        return this.layout.get_names();
    };
    
    this.get_asset_url = function(version) {
        if (version === undefined) {
            return this.cip.config.endpoint + "asset/download/"+ catalog.alias +"/" + this.fields.id;
        } else {
            return this.cip.config.endpoint + "asset/download/"+ catalog.alias +"/" + this.fields.id + "?version="+version;
        }
    };
    
    this.get_versions = function() {
        var returnvalue = null;
        this.cip.ciprequest("asset/getversions/"+catalog.alias+ "/" + this.fields.id , 
                            {}, 
                            function(response) {
                                returnvalue = response.versions;
                            }
                           );
        
        return returnvalue;
    };
}
