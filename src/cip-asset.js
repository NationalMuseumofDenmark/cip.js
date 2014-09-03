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
        var named_parameters = {};
        if (version !== undefined) {
            named_parameters['version'] = version;
        }
        return this.cip.generate_url(
            "asset/download/"+ catalog.alias +"/" + this.fields.id,
            named_parameters
        );
    };
    
    /**
     * Gets a list of objects representing the available versions for the asset.
     * @param {function} callback The function to be called with the results of the query.
     */
    this.get_versions = function(callback) {
        this.cip.ciprequest("asset/getversions/"+catalog.alias+ "/" + this.fields.id , 
                            {}, 
                            function(response) {
                                callback(response.versions);
                            }
                           );
    };
    
    /**
     * Returns a URL for a full-size preview of the asset.
     */
    this.get_image_url = function(named_parameters)  {
        // TODO: Consider filtering the named parameters, as in get_thumbnail_url.
        return this.cip.generate_url(
            "preview/image/"+ catalog.alias +"/" + this.fields.id,
            named_parameters
        );
    };
    
    /**
     * Returns a URL for a thumbnail image.
     * @param {object} given_named_parameters - Option definitions for the thumbnails. You can define the following parameters: size, maxsize, rotate, format, quality. All of them are integers, except for format which is either 'png' or 'jpeg'. Moreover rotate must be divisible by 90.
     */
    this.get_thumbnail_url = function(given_named_parameters) {
        var option_string = "";
        var ampersand = "";
        var before_querystring = "";
        var named_parameters = {};
        var allowed_attributes = ["size", "maxsize", "rotate", "format", "quality"];
        
        // Ensure that only the given named_parameters are added to the query string
        if (given_named_parameters === undefined) {
            given_named_parameters = {};
        }

        for (var i in allowed_attributes) {
            if (given_named_parameters[allowed_attributes[i]] !== undefined) {
                if (allowed_attributes[i] !== "format") {
                    named_parameters[allowed_attributes[i]] = parseInt(given_named_parameters[allowed_attributes[i]]);
                } else {
                    named_parameters[allowed_attributes[i]] = given_named_parameters[allowed_attributes[i]];
                }
            }
        }

        return this.cip.generate_url(
            "preview/thumbnail/"+ catalog.alias +"/" + this.fields.id,
            named_parameters
        );
    };
}

if(typeof(exports) != "undefined") {
    exports.CIPAsset = CIPAsset;
} else {
    window.cip_asset = {
        CIPAsset: CIPAsset
    }
}
