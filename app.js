var express = require('express')
  , app = express() // Web framework MVC 'sinatra-like' to handle routing requests
  , cons = require('consolidate') // Templating library adapter for Express
  , MongoClient = require('mongodb').MongoClient // Driver for connecting to MongoDB
  , routes = require('./routes'); 


// Connection url: path/port/databaseName
// If no database with this name exists, mongoDB automatically creates a database
var url = 'mongodb://localhost:27017/blogI';  

// Connect to the server    
MongoClient.connect(url, function(err, db) {
    "use strict";
    
    if(err) throw err;

    console.log("Connection to Mongo sucessfull!")
    
    // Register our templating engine
    app.engine('html', cons.swig);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');

    // Express middleware to populate 'req.cookies' so we can access cookies
    app.use(express.cookieParser());

    // Express middleware to populate 'req.body' so we can access POST variables
    app.use(express.json());
    app.use(express.urlencoded());	
	
    // Application routes
    routes(app, db);

    // Node server listening on port 3000
    app.listen(3000);
    console.log('Express server listening on port 3000 @ UOM Services');
});
