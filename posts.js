/* The PostsDAO must be constructed with a connected database object */
function PostsDAO(db) {
    "use strict";

    // If this constructor is called without the "new" operator
    if (false === (this instanceof PostsDAO)) {
        console.log('PostsDAO constructor called without "new" operator');
        return new PostsDAO(db);
    }
    
    //Get from mongo collection posts and assign it to a variable named posts	
    var posts = db.collection("posts");
    // If no collection exists, mongoDB automatically
    // creates a new collection


    // Function to search posts with given title
    // Mongo shell, db.posts.ensureIndex({'title': 'text'})
    this.searchPost = function(title, searchPosts) {
        "use strict";
        
        console.log("Searching for a post with title "  + title + "");
        
        // Mongo
        posts.find({"$text": {"$search": title }}).sort('date', -1).toArray(function(err, items) {
            "use strict";

            if (err) return (err, null);

            console.log("Searched "  + items.length + " posts with this title");

            searchPosts(err, items);
        });
    }


    this.getPosts = function(skipnum, limitnum, foundPosts) {
        "use strict";
        
    // Mongo
    // Find all posts, sorted by date DESC, limit by num
    // Indexing in mongo shell, db.posts.ensureIndex({'date':-1})

        posts.find().sort('date', -1).skip(skipnum).limit(limitnum).toArray(function(err, items) {
            "use strict";
        
            if (err) return (err, null);

            console.log("Found " + items.length + " posts");

            foundPosts(err, items);
        });
    }

    this.getPostByTitle = function(title, foundPostByTitle) {
        "use strict";
        
        // Mongo
        // Find one post by Title
        posts.findOne({'title': title}, function(err, post) {
            "use strict";

            if (err) return (err, null);
            
            console.log("Found post with the same title");

            foundPostByTitle(err, post);
        });
   
    }

    //Function that inserts a post 	
    this.insertEntry = function (title, body, tags, author, insertedPost) {
        "use strict";
        console.log("inserting blog entry" + title + body);


        // fix up the permalink to not include whitespace
        var permalink = title.replace( /\s/g, '_' );
        permalink = permalink.replace( /\W/g, '' );
        
        // Create post document, relative schema for post, can change dyamically
        var post = {"title": title,
                "author": author,
                "body":  body,
                "permalink":  permalink,
                "tags":  tags,
                "comments":  [],
                "date": new Date()}

        // Now insert post in database        
        posts.insert(post, function (err, result) {
            "use strict";

            // If err throw err, callback
            if (err) return (err, null);
            
            
            console.log("Inserted new post");
            //Insert post if no err, and return permalink
            insertedPost(err, permalink);
        });
     
    }


    this.getPostsByTag = function(tag, num, foundTags) {
        "use strict";
        
	// Mongo
	// Find all posts by given tag, sorted by date DESC, limit by num
	// Indexing in mongo shell related to performance
	// db.posts.ensureIndex( { 'tags':1,'date':-1})
        posts.find({ 'tags' : tag }).sort('date', -1).limit(num).toArray(function (err, items) {
            "use strict";

            if (err) return (err, null);

            console.log("Found " + items.length + " posts");

            foundTags(err, items);
        });
    }

    this.getPostByPermalink = function(permalink, foundPostByPermalink) {
        "use strict";
        
        // Mongo
        // Find one post by permalink
        // Indexing in mongo shell, db.posts.ensureIndex({ permalink : 1 } )
        posts.findOne({'permalink': permalink}, function(err, post) {
            "use strict";

            if (err) return (err, null);

            foundPostByPermalink(err, post);
        });
    }
   
    // Function that adds comment, updating the array Comments
    this.addComment = function(permalink, name, email, body, addComment) {
        "use strict";

        // Create comment sub-document, relative schema for comment, can change dyamically
        var comment = {'author': name, 'body': body}

        if (email != "") {
            comment['email'] = email
        }
	
    // Mongo
   	// Now add the comment using update
   	posts.update(
                { 'permalink' : permalink}, 
                { '$push': { 'comments' : comment}},
                function (err, numModified) {
                "use strict";

                if (err) return (err, null);
            

                addComment(err, numModified);
            });
    }
}

module.exports.PostsDAO = PostsDAO;  // Post database object
