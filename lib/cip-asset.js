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
    
    /**
     * Gets a metadata field by name.
     * @param {string} name - The name of the field.
     */
    this.get_field_value = function(name) {
        // stub
    };
    
    /**
     * Gets a list of metadata fields available for the asset.
     */
    this.get_fields = function() {
        // stub
    };
    
    /**
     * Gets the full-version download URL for the asset.
     * @param {int} version - The version of the asset to download. If undefined, it will give you the most recent.
     */
    this.get_asset_url = function(version) {
        if (version === undefined) {
            return this.cip.config.endpoint + "asset/download/"+ catalog.alias +"/" + this.fields.id;
        } else {
            return this.cip.config.endpoint + "asset/download/"+ catalog.alias +"/" + this.fields.id + "?version="+version;
        }
    };
    
    /**
     * Gets a list of objects representing the available versions for the asset.
     */
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
    
    /**
     * Returns a URL for a full-size preview of the asset.
     */
    this.get_preview_url = function()  {
        return this.cip.config.endpoint + "preview/image/"+ catalog.alias +"/" + this.fields.id;
    };
    
    /**
     * Returns a URL for a thumbnail image.
     * @param {object} given_options - Option definitions for the thumbnails. You can define the following parameters: size, maxsize, rotate, format, quality. All of them are integers, except for format which is either 'png' or 'jpeg'. Moreover quality must be divisible by 90.
     */
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
