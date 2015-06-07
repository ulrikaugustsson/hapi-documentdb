var DocumentClient = require('documentdb').DocumentClient;
var Hoek = require('hoek');

var internals = {};
var externals = {};

exports.register = function (plugin, options, next) {

	Hoek.assert(options.endpoint !== undefined, 'endpoint must be defined');
	Hoek.assert(options.masterKey !== undefined, 'masterKey must be defined');

	externals.client = new DocumentClient(options.endpoint, {'masterKey': options.masterKey});
	externals.methods = {
		getOrCreateDatabase: getOrCreateDatabase,
		getOrCreateCollection: getOrCreateCollection,
		getDocuments: getDocuments
	},

	plugin.expose('client', externals.client);
	plugin.expose('methods', externals.methods);

	next();
};

exports.register.attributes = {
	pkg: require('../package.json')
};


function getOrCreateDatabase(databaseId, callback) {

	var querySpec = {
		query: 'SELECT * FROM root r WHERE r.id=@id',
		parameters: [{
			name: '@id',
			value: databaseId
		}]
	};

	externals.client.queryDatabases(querySpec).toArray(function (err, results) {

		if (err) {
			callback(err);
		} else {
			if (results.length === 0) {
				var databaseSpec = {
					id: databaseId
				};

				internals.documentDb.client.createDatabase(databaseSpec, function (err, created) {

					if (err) {
						return callback(err);
					}
					return callback(null, created);
				});
			} else {
				return callback(null, results[0]);
			}
		}
	});
}

function getOrCreateCollection(databaseLink, collectionId, callback) {

	var querySpec = {
		query: 'SELECT * FROM root r WHERE r.id=@id',
		parameters: [{
			name: '@id',
			value: collectionId
		}]
	};

	externals.client.queryCollections(databaseLink, querySpec).toArray(function (err, results) {

		if (err) {
			callback(err);
		} else {
			if (results.length === 0) {
				var collectionSpec = {
					id: collectionId
				};

				internals.documentDb.client.createCollection(databaseLink, collectionSpec, function (err, created) {

					callback(null, created);
				});

			} else {
				callback(null, results[0]);
			}
		}
	});
}

function getDocuments(collection, querySpec, callback) {

	externals.client.queryDocuments(collection._self, querySpec).toArray(function (err, results) {

		if (err) {
			return callback(err);
		}
		callback(null, results);
	});
}
