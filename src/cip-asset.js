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
        return cip.generateURL([
            'asset',
            'download',
            catalog.alias,
            this.fields.id
        ], namedParameters);
    };

    /**
     * Gets a list of objects representing the available versions for the asset.
     * @param {function} callback The function to be called with the results of the query.
     */
    this.getVersions = function(callback) {
        return cip.request([
          'asset',
          'getversions',
          catalog.alias,
          this.fields.id
        ]).then(function(response) {
            return response.versions;
        });
    };

    /**
     * Returns a URL for a full-size preview of the asset.
     */
    this.getImageURL = function(namedParameters)  {
        // TODO: Consider filtering the named parameters, as in get_thumbnail_url.
        return cip.generateURL([
            'preview',
            'image',
            catalog.alias,
            this.fields.id
        ], namedParameters);
    };

    /**
     * Returns a URL for a thumbnail image.
     * @param {object} givenNamedParameters - Option definitions for the thumbnails. You can define the following parameters: size, maxsize, rotate, format, quality. All of them are integers, except for format which is either 'png' or 'jpeg'. Moreover rotate must be divisible by 90.
     */
    this.getThumbnailURL = function(givenNamedParameters, withoutJSessionID) {
        var namedParameters = {};
        var allowedAttributes = ['size', 'maxsize', 'rotate', 'format', 'quality'];

        // Ensure that only the given namedParameters are added to the query string
        if (givenNamedParameters === undefined) {
            givenNamedParameters = {};
        }

        for (var i in allowedAttributes) {
            if (givenNamedParameters[allowedAttributes[i]] !== undefined) {
                if (allowedAttributes[i] !== 'format') {
                    namedParameters[allowedAttributes[i]] = parseInt(givenNamedParameters[allowedAttributes[i]]);
                } else {
                    namedParameters[allowedAttributes[i]] = givenNamedParameters[allowedAttributes[i]];
                }
            }
        }

        return cip.generateURL([
          'preview',
          'thumbnail',
          catalog.alias,
          this.fields.id
        ], namedParameters, withoutJSessionID);
    };

    /**
     * Returns a URL for a thumbnail image.
     * See: http://cumulus.natmus.dk/CIP/doc/CIP.html#metadata_getrelatedassets
     * @param {string} relation - Possible values: contains, iscontainedin, references, isreferencedby, isvariantmasterof, isvariantof, isalternatemaster, isalternateof
     */
    this.getRelatedAssets = function(relation) {
        return cip.request([
            'metadata',
            'getrelatedassets',
            catalog.alias,
            this.fields.id,
            relation
        ]);
    };
}

exports.CIPAsset = CIPAsset;
