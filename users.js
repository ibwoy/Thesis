var bcrypt = require('bcrypt-nodejs'); // Modules required

/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
    "use strict";

    // If this constructor is called without the "new" operator
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }
    
    //  Get from mongo collection 'users' and assign it to a variable named users	
    var users = db.collection("users"); 
    // If no collection exists, mongoDB automatically
    // creates a new collection
    
    // Function that adds a user to database
    this.addUser = function(username, password, email, insertUser) {
        "use strict";

        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document, relative schema for a user, can change dyamically
        var user = {'_id': username, 'password': password_hash};

        // Add email if set
        if (email != "") {
            user['email'] = email;
        }
    	
    	
        // Mongo
        // Insert user in database
	       users.insert(user, function ( err, result) {
			"use strict";
			
			 if (!err) {
				console.log("Inserted new user");
				return insertUser(null, result[0]);
			 }
			
			 return insertUser(err, null);
		  });
			
    }

    // Example with callback, all other callback functions renamed for easy-use
    this.validateLogin = function(username, password, callback) {
        "use strict";

        // Callback to pass to mongoDB that validates a user document
        function validateUserDoc(err, user) {
            "use strict";
            
            if (err) return callback(err, null);
			
            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                }
                else {
                    var invalid_password_error = new Error("Invalid password");
                    // Set an extra field so we can distinguish this from a db error
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }
            else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
       
        }
        
        // Mongo
        // Find user in database and validate him
        users.findOne({ '_id' : username }, validateUserDoc);
  
   }
}

module.exports.UsersDAO = UsersDAO; // User database object
