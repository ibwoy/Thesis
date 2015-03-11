var crypto = require('crypto'); //Modules required

/* The SessionsDAO must be constructed with a connected database object */
function SessionsDAO(db) {
    "use strict";

    // If this constructor is called without the "new" operator   
    if (false === (this instanceof SessionsDAO)) {
        console.log('Warning: SessionsDAO constructor called without "new" operator');
        return new SessionsDAO(db);
    }
    
    // Get from mongo collection 'sessions' and assign it to a variable named sessions	
    var sessions = db.collection("sessions");
    // If no collection exists, mongoDB automatically
    // creates a new collection


    this.startSession = function(username, startSession) {
        "use strict";

        // Generate session id
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var session_id = crypto.createHash('sha1').update(current_date + random).digest('hex');

        // Create session document, relative schema for session, can change dyamically
        var session = {'username': username, '_id': session_id}
	
        // Mongo
        // Insert session document
        sessions.insert(session, function (err, result) {
            "use strict";
            startSession(err, session_id);
        });
    }

    this.endSession = function(session_id, removeSession) {
        "use strict";
        
        // Mongo
        // Remove session document
        sessions.remove({ '_id' : session_id }, function (err) {
            "use strict";
            removeSession(err);
        });
    }
    
    this.getUsername = function(session_id, getUser) {
        "use strict";

        if (!session_id) {
            getUser(Error("Session not set"), null);
            return;
        }
	
	   // Mongo
	   // Find one session
        sessions.findOne({ '_id' : session_id }, function (err, session) {
            "use strict";

            if (err) return callback(err, null);

            if (!session) {
                getUser(new Error("Session: " + session + " does not exist"), null);
                return;
            }

            getUser(null, session.username);
        });
    }
}

module.exports.SessionsDAO = SessionsDAO; // Session database object
