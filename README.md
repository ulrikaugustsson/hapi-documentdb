# hapi-documentdb
Hapi plugin for documentdb

## installation
```
npm install hapi-documentdb --save
```

## usage
```js
server.register(
	[{
		register: require('hapi-documentdb'),
		options: {
			endpoint: process.env.AZURE_DOCUMENTDB_ENDPOINT,
			masterKey: process.env.AZURE_DOCUMENTDB_MASTERKEY
		}
	}],
	function (err) {

		if (err) {
			console.error(err);
		}
	}
);

var client = server.plugins['hapi-documentdb'].client;
var dbMethod = server.plugins['hapi-documentdb'].methods;

var database, collection;

dbMethod.getOrCreateDatabase('exampleDb', function (err, db) {

	if (err) {
		return server.log(err);
	}
	database = db;
	dbMethod.getOrCreateCollection(database._self, 'tasks', function (err, coll) {

		if (err) {
			return server.log(err);
		}
		collection = coll;
	});
});

server.route(
{
	method: 'GET',
	path: '/tasks/{id}',
	handler: function (request, reply) {
		client.queryDocuments(
			collection._self,
			"SELECT * FROM docs d WHERE d.id = '" + request.params.id + "'"
		).toArray(function (err, results) {
			if (err) {
				server.log('error', 'Query ' + err);
				return reply(err);
			}
			reply(null, results);
		});
	}
});
```
