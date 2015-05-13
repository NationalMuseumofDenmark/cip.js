/**
 * CIP.js - a CIP client in JavaScript
 * Jens Christian Hillerup, BIT BLUEPRINT - jc@bitblueprint.com
 * 
 * This code includes the Qwest library in order to handle AJAX
 * requests in a nice way. Qwest is released under an MIT license.
 */

if(typeof(require) != "undefined") {
	request = require('request');
	cip_catalog = require('./cip-catalog.js');
	cip_searchresult = require('./cip-searchresult.js');
	cip_common = require('./cip-common.js');
}

/**
 * A general-purpose client library for CIP endpoints. Implements session
 * handling and requests.
 * @constructor
 * @param {string} config - A "handle" object defining various settings about the CIP endpoint.
 */

function CIPClient(config) {
	this.config = config;
	this.jsessionid = null;
	this.DEBUG = true;
	
	cip_common.assert(config !== undefined, "The CIPClient must be passed a config object.");
	cip_common.assert(config.endpoint !== undefined, "The config must have an endpoint property.");

	this.cache = {
		catalogs: null
	};

	this.default_named_parameters = {
		apiversion: 4,
		serveraddress: "localhost"
	};

	/** 
	 * Populates an object with named parameters with the default values.
	 * 
	 * @param {object}|{false} named_parameters - The parameters for the
	 *        query string, false if they should be leaved out.
	 */
	this.named_parameters_with_defaults = function( given_named_parameters ) {
		var named_parameters = {};

		// We start with the default named parameters
		for(var p in this.default_named_parameters) {
			named_parameters[p] = this.default_named_parameters[p];
		}

		// Did we get any named parameters?
		if(typeof(given_named_parameters) === "undefined" || given_named_parameters === null) {
			given_named_parameters = {};
		} else if(typeof(given_named_parameters) !== "object") {
			throw "The named_parameters parameter must be an object, undefined or null.";
		}

		// Overwrite default named parameters.
		for(var g in given_named_parameters) {
			var value = given_named_parameters[g];
			if(value !== null && value !== undefined) {
				named_parameters[g] = value;
			}
		}
		return named_parameters;
	};

	/** 
	 * Generates a URL to the CIP server.
	 * 
	 * @param {string} operation - The name of the function (the path).
	 * @param {object}|{false} named_parameters - The parameters for the
	 *        query string, false if they should be leaved out.
	 * @param {boolean} without_jsessionid - Should the jsessionid be left out of the URL? Default: false
	 */
	this.generate_url = function( operation, named_parameters, without_jsessionid ) {
		var result = this.config.endpoint + operation;
		var query_string = "";

		// Should we include the jsessionid?
		if(without_jsessionid !== true && this.jsessionid) {
			result += ";jsessionid=" + this.jsessionid;
		}

		// Populate with defaults.
		if(named_parameters !== false) {
			named_parameters = this.named_parameters_with_defaults(named_parameters);
		} else {
			named_parameters = {};
		}

		// Generate the query string from the named parameters.
		for(var p in named_parameters) {
			if(query_string.length > 0) {
				query_string += "&";
			}
			query_string += p + "=" + named_parameters[p];
		}

		// Prepend the question mark if a query exists.
		if(query_string.length > 0) {
			result += "?" + query_string;
		}

		return result;
	};

	/** 
	 * Makes a request to the CIP server.
	 * 
	 * @param {string} operation - The name of the function (the path).
	 * @param {object}|{boolean} named_parameters - POST-data options to pass, if false - defaults are left out.
	 * @param {function} success - The callback function on success.
	 * @param {function} error - The callback function on failure.
	 * @param {boolean} async - Whether the call should be asynchronous
	 */
	this.ciprequest = function(operation, named_parameters, success, error, async) {
		var self = this; // TODO: Fix this hack

		if(typeof(operation) === 'object') {
			operation = operation.join("/");
		}

		if (async === undefined) {
			async = false;
		}
		if (this.jsessionid === null && operation !== "session/open") {
			console.warn("No jsessionid - consider calling session_open before calling other action.");
		}

		if (typeof(success) === "function") {
			success = success.bind(this);
		} else {
			// The default success function.
			success = function(response) {
				console.warn( "Unhandled success from the CIP - consider adding a success callback function the ciprequest call." );
				console.log( response );
			};
		}

		if (typeof(error) === "function") {
			// TODO: Consider chaning this back - without this binding the error function
			// will stay bound to the qwest request within a browser.
			// error = error.bind(this);
		} else {
			// The default error function.
			error = function(response) {
				console.warn( "Unhandled error from the CIP - consider adding an error callback function the ciprequest call." );
				console.error( "An error occured when communicating with the CIP.", response );
				console.trace();
			};
		}

		// We are using post calls, so the named parameters go to the body.
		named_parameters = this.named_parameters_with_defaults(named_parameters);

		var url = this.generate_url( operation, false );

		if(typeof(require) != "undefined" && request) {
			return request.post(
				{
					url: url,
					method: 'POST',
					form: named_parameters,
					timeout: 60000, // 60 secs
					useQuerystring: true
				},
				function(is_error, response, body) {
					if(is_error) {
						error(is_error);
					} else if(response === null || typeof(response) === 'undefined') {
						var err = new Error('Got a null or undefined response from the CIP.');
						error(err);
					} else if(response.statusCode >= 200 && response.statusCode < 400) {
						if(response.body === "") {
							success();
						} else {
							// We have a body that is assumed to be JSON parseable.
							success(JSON.parse(response.body));
						}
					} else {
						error(response.body || null);
					}
				}
			);
		} else if ( qwest && typeof(qwest) === 'object' ) {
			return qwest.post(
				url,
				named_parameters,
				{ async: async }
			).success(success).error(error);
		}
	};
	
	/**
	 * Opens a session to the CIP endpoint with the given username
	 * and password. This function, unlike most other functions in 
	 * this SDK is asynchronous. The philosophy is that all library 
	 * calls should be synchronous but called within asynchronous
	 * *handlers* (like this one).
	 * 
	 * @param {string} username - The username to log in with.
	 * @param {string} password - The password to log in with.
	 * @param {function} success - The callback function on success.
	 * @param {function} error - The callback function on failure.
	 */
	this.session_open = function(username, password, success_callback, error_callback) {
		var self = this; // TODO: fix this hack

		this.ciprequest("session/open", {
			user: username,
			password: password
		}, function(response) {
			if (response && response != undefined && response.jsessionid) {
				self.jsessionid = response.jsessionid;
				success_callback(response);
			} else {
				debugger;
				error_callback("SessionID is missing from the response!");
				// fail
				return;
			}
		},
		error_callback,
		true);

	};
	
	/**
	 * Closes the currently open session.
	 */
	this.session_close = function() {
		this.ciprequest("session/close", {});
		//qwest.post(this.CIP_BASE + "session/close", {jsessionid: this.jsessionid});
	};

	/**
	 * Returns true if the CIP connection is established.
	 */
	this.is_connected = function() {
		// If the CIP connection has a session ID, we're connected.
		return this.jsessionid !== null;
	};    
	
	/** 
	 * Returns a list of catalogs on the CIP service. Caches the result.
	 * @param {function} callback The callback
	 * @param {function} error_callback - The callback function called an error occurs.
	 */
	this.get_catalogs = function(callback, error_callback) {
		cip_common.assert(this.is_connected());

		if (this.cache.catalogs !== null) {
			callback(this.cache.catalogs);
		}

		this.ciprequest("metadata/getcatalogs", {}, function(response) {
			if(response == null) {
				callback(null);
			} else {
				this.cache.catalogs =  [];
				var aliases = this.config['catalog_aliases'];
			
				for (var i=0; i < response.catalogs.length; i++) {
					var catobj = response.catalogs[i];
					if ((catobj.name in aliases))  {
						var catalog = new cip_catalog.CIPCatalog(this, response.catalogs[i]);
						this.cache.catalogs.push(catalog);
					}
				}
				callback(this.cache.catalogs);
			}
		}, error_callback);
		
	};
	
	/**
	 * Performs a metadata search in the CIP. Called from higher-level classes.
	 * @param {object} table - The table to search in, as returned by NatMus#get_tables.
	 * @param {string} query - The query to search for.
	 * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
	 * @param {function} error_callback - The callback function called an error occurs.
	 */
	this.search = function(table, query, callback, error_callback) {
		return this.advancedsearch(table, undefined, query, undefined, callback, error_callback);
	};
	
	/**
	 * Performs a metadata search in the CIP given as a query string. Called from higher-level classes.
	 * @param {object} table - The table to search in, as returned by NatMus#get_tables.
	 * @param {string} querystring - The query to search for.
	 * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
	 * @param {function} error_callback - The callback function called an error occurs.
	 */
	this.criteriasearch = function(table, querystring, sortby, callback, error_callback) {
		return this.advancedsearch(table, querystring, undefined, sortby, callback, error_callback);
	};
	
	/**
	 * Performs an advanced metadata search in the CIP given as a query string and a search term.
	 * The query string is in Cumulus Query Language and the search term is a simple human-readable textstring.
	 * @param {object} table - The table to search in, as returned by NatMus#get_tables.
	 * @param {string} querystring - The query to search for.
	 * @param {string} searchterm - The free-text to search for.
	 * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPSearchResult.
	 * @param {function} error_callback - The callback function called an error occurs.
	 */
	this.advancedsearch = function(table, querystring, searchterm, sortby, callback, error_callback, return_single_asset) {
		cip_common.assert(this.is_connected());
		cip_common.assert(table.catalog.alias !== undefined, "Catalog must have an alias.");
		cip_common.assert(querystring !== undefined || searchterm !== undefined, "Either querystring or searchterm must be defined.");

		if(return_single_asset) {
			// If we are going for a single asset, we might as well exclude the
			// collection and include the view path-parameter right away.
			//
			cip_common.assert(this.config.constants && this.config.constants.layout_alias,
				"The layout_alias constant must be set in the config.");
			// Make the request.
			this.ciprequest(
				[ "metadata", "search", table.catalog.alias, this.config.constants.layout_alias ],
				{
					querystring: querystring,
					quicksearchstring: searchterm,
					sortby: sortby,
					table: table.name,
					maxreturned: 1
				}, function(response) {
					if(response) {
						if(response.items) {
							if(response.items.length === 1) {
								callback(new cip_asset.CIPAsset(this, response.items[0], table.catalog));
							} else {
								error_callback( new Error('Expected one asset, got ' + response.items.length) );
							}
						} else {
							response = JSON.stringify(response);
							error_callback( new Error('Malformed response, missing the items, got ' +response) );
						}
					} else {
						error_callback( new Error('Received an empty result from the CIP, when searching.') );
					}
				}, error_callback
			);
		} else {
			this.ciprequest(
				[ "metadata", "search", table.catalog.alias ],
				{
					querystring: querystring,
					quicksearchstring: searchterm,
					sortby: sortby,
					table: table.name,
					collection: ""  // We pass an empty collection to get the system to create one for us and return the name
				}, function(response) {
					if(response) {
						callback(new cip_searchresult.CIPSearchResult(this, response, table.catalog));
					} else {
						error_callback( new Error('Received an empty result from the CIP, when searching.') );
					}
				}, error_callback
			);
		}
	};
	
	/**
	 * Gives a reference to a CIPAsset with or without its metadata.
	 * @param {string} catalog_alias - The catalog alias from with to fetch the asset.
	 * @param {number} asset_id - The ID of the asset as known in Cumulus.
	 * @param {boolean} fetch_metadata - Should the CIPAsset have it's metadata populated?
	 * @param {function} callback - The callback function called when an answer is ready, this is passed an instance of CIPAsset.
	 * @param {function} callback - The callback function called if something goes wrong.
	 */
	this.get_asset = function(catalog_alias, asset_id, fetch_metadata, callback, error_callback) {
		var table = this.get_table(catalog_alias);
		// The asset_id must be sat.
		cip_common.assert(asset_id !== undefined, "The asset_id must have a value.");
		
		if(fetch_metadata === true) {
			// Search for the id, no searchterm or sorting. The final boolean argument
			// tells the search to return a single asset, without creating an
			// intermediary result object.
			this.advancedsearch(table, 'id == ' + asset_id, undefined, null, function(asset) {
				callback( asset );
			}, error_callback, true);
		} else {
			var asset = new cip_asset.CIPAsset(this, { id: asset_id }, table.catalog);
			callback( asset );
		}
	};

	/**
	 * Gives a reference to a CIPTable.
	 * @param {string} catalog_alias - The catalog alias from with to fetch the asset.
	 * @param {string} table_name - The name of the table as known in Cumulus.
	 * @return {CIPTable} An object representing a table in the CIP.
	 */
	this.get_table = function(catalog_alias, table_name) {
		cip_common.assert(catalog_alias !== undefined, "Catalog must have an alias.");
		if(typeof(table_name) == "undefined") {
			table_name = "AssetRecords";
		}
		var catalog = new cip_catalog.CIPCatalog(this, { alias: catalog_alias });
		var table = new cip_table.CIPTable(this, catalog, table_name);
		return table;
	};
	
	/**
	 * Gets the version of the various services on the CIP stack.
	 * @param {function} callback - A function that is called with an object as first argument when the request succeeds.
	 * @param {function} error_callback - A function that is called when the request fails.
	 */
	this.get_version = function(callback, error_callback) {
		cip_common.assert(typeof(callback) === "function", "The callback must be a function.");
		this.ciprequest("system/getversion", {}, function(response) {
			callback(response.version);
		}, error_callback);
	};
}

if(typeof(exports) != "undefined") {
	exports.CIPClient = CIPClient;
}
