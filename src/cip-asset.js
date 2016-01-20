/**
 * An asset in CIP.
 * @constructor
 * @param {CIPClient} cip - The CIP client
 * @param {object} fields - The asset fields
 * @param {CIPCatalog} catalog - The catalog to which the asset belongs
 */

function CIPAsset(cip, fields, catalog) {
    this.fields = fields;

    /**
     * Gets a metadata field by name.
     * @param {string} name - The name of the field.
     */
    this.getFieldValue = function(name) {
        // stub
    };

    /**
     * Gets a list of metadata fields available for the asset.
     */
    this.getFields = function() {
        // stub
    };

    /**
     * Gets the full-version download URL for the asset.
     * @param {int} version - The version of the asset to download. If undefined, it will give you the most recent.
     */
    this.getAssetURL = function(version) {
        var namedParameters = {};
        if (version !== undefined) {
            namedParameters['version'] = version;
        }
        return cip.generateURL(
            "asset/download/"+ catalog.alias +"/" + this.fields.id,
            namedParameters
        );
    };

    /**
     * Gets a list of objects representing the available versions for the asset.
     * @param {function} callback The function to be called with the results of the query.
     */
    this.getVersions = function(callback) {
        cip.request(
          ['asset', 'getversions', catalog.alias, this.fields.id],
          {},
          false).then(function(response) {
              callback(response.versions);
          });
    };

    /**
     * Returns a URL for a full-size preview of the asset.
     */
    this.getImageURL = function(namedParameters)  {
        // TODO: Consider filtering the named parameters, as in get_thumbnail_url.
        return cip.generateURL(
            "preview/image/"+ catalog.alias +"/" + this.fields.id,
            namedParameters
        );
    };

    /**
     * Returns a URL for a thumbnail image.
     * @param {object} given_named_parameters - Option definitions for the thumbnails. You can define the following parameters: size, maxsize, rotate, format, quality. All of them are integers, except for format which is either 'png' or 'jpeg'. Moreover rotate must be divisible by 90.
     */
    this.getThumbnailURL = function(given_named_parameters, include_jsessionid) {
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

        return cip.generate_url(
            "preview/thumbnail/"+ catalog.alias +"/" + this.fields.id,
            named_parameters
        );
    };

    /**
     * Returns a URL for a thumbnail image.
     * See: http://cumulus.natmus.dk/CIP/doc/CIP.html#metadata_getrelatedassets
     * @param {string} relation - Possible values: contains, iscontainedin, references, isreferencedby, isvariantmasterof, isvariantof, isalternatemaster, isalternateof
     */
    this.getRelatedAssets = function(relation) {
        return cip.request([
            "metadata",
            "getrelatedassets",
            catalog.alias,
            this.fields.id,
            relation
        ], {}, false);
    };
}

exports.CIPAsset = CIPAsset;
