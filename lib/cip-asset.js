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
        // stub
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
    
    this.get_preview_url = function()  {
        return this.cip.config.endpoint + "preview/image/"+ catalog.alias +"/" + this.fields.id;
    };
    
    this.get_thumbnail_url = function(given_options) {
        var option_string = "";
        var ampersand = "";
        var options = {};
        var allowed_attributes = ["size", "maxsize", "rotate", "format", "quality"];
        
        // Ensure that only the given options are added to the query string
        if (given_options !== undefined) {
            for (var i in allowed_attributes) {
                if (given_options[allowed_attributes[i]] !== undefined) {
                    if (allowed_attributes[i] !== "format") {
                        options[allowed_attributes[i]] = parseInt(given_options[allowed_attributes[i]]);
                    } else {
                        options[allowed_attributes[i]] = given_options[allowed_attributes[i]];
                    }
                }
            }
        }

        for (var option in options) {
            option_string += ampersand + option + "=" + options[option];
            
            ampersand = "&";
        }
        
        return this.cip.config.endpoint + "preview/thumbnail/"+ catalog.alias +"/" + this.fields.id + "?" + option_string;
    };
}
