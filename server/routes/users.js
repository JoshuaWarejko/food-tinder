const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Collection = require('../models/collection');
const utilities = require('@adf/utilities');
const jwt = require('jsonwebtoken');
const tokenHandler = require('../config/token-handler');
const helpers = require('../config/helpers');
const async = require('async');

const TokenHandler = new tokenHandler();

if(process.env.NODE_ENV == "development") {
    // Get users
    router.get('/', function(req, res, next) {
        User.find({}).then((users) => {
            res.json(helpers.response(users, "Successfully retrieved users", 200));
        }).catch((err) => {
            return next(err);
        });
    });
}

// POST / - route to create new users.
router.post('/', function(req, res, next) {
    
    if(!req.body.name) {
        return next(helpers.basicError("Name is required to create an account", 400)); 
    }
    if(!req.body.email) {
        return next(helpers.basicError("Email is required to create an account", 400));
    }
    if(!req.body.password) {
        return next(helpers.basicError("Password required to create an account", 400));
    }
    
    // Create object from input
    let userData = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    
    // use schema's create method to insert document into Mongo
    User.create(userData, (error, user) => {
        if(error) {
            if(error.errors.email && error.errors.email.kind == 'unique') {
                return next(helpers.basicError(error.errors.email.message, 400));
            }
            return next(error);
        } else {
            const data = {
                id: user._id,
                dateJoined: user.dateJoined,
                name: user.name,
                email: user.email,
                lastUpdated: user.lastUpdated
            }
            return res.status(201).json(helpers.response(data, "Sucessfully created new user", 201));
        }
    });
});

// POST /authenticate - route to authenticate a user.
router.post('/authenticate', function(req, res, next) {
    
    if(!req.body.email || !req.body.password) {
        return next(helpers.basicError("Both email and password are required to login", 400));
    }

    
    User.authenticate(req.body.email, req.body.password, function(error, user) {
        if(error || !user) {
            return next(utilities.createError("Wrong email or password"), 401);
        }
        const payload = {
            id: user._id,
            email: user.email
        };
        
        let token = jwt.sign(payload, app.get('superSecret'), {
            expiresIn: 86400 // In seconds (expires in 24 hours)
        });
        
        // return the information including token as JSON
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
        });
    });
});

// GET /:userId - get user based on ID
router.get('/:userId', TokenHandler.verifyUser, function(req, res, next) {
    if(!req.params.userId) {
        return next(helpers.basicError("No user ID present in request url", 401));
    }
    return User.findOne({
        _id: req.params.userId
    }).then((user) => {
        return res.status(200).json(helpers.response(user, "Success", 200));
    }).catch((err) => {
        return next(err);
    });
});

// PUT /:userId/update - update specific user.
router.put('/:userId/update', TokenHandler.verifyUser, function(req, res, next) {
    if(!req.params.userId) {
        return next(helpers.basicError("No user ID present in request url", 401));
    }
    return async.waterfall([
        function(callback) {
            return User.findOne({
                _id: req.params.userId
            }).then((user) => {
                if(req.body.name) {
                    user.set({ name: req.body.name });
                }
                if(req.body.email) {
                    user.set({ email: req.body.email });
                }
                return callback(null, user);
            }).catch((err) => {
                return callback(err);
            });
        }, function(user, callback) {
            return user.save(function(err, updatedUser) {
                if(err) return next(err);
                return callback(null, helpers.response(updatedUser, "Successfully updated user", 200));
            });
        }
    ], (error, response) => {
        if(error) return next(error);
        return res.status(200).json(response);
    }); 
});

// POST /:userId/collections(Collection, token): Collection - Create collection for specified user.
router.post('/:userId/collections', TokenHandler.verifyUser, function(req, res, next) {
    
    if(!req.params.userId) {
        return next(helpers.basicError("No user ID present in request url", 401));
    }
    
    if(!req.body.collection) {
        return next(helpers.basicError("Collection data required to create collection for user", 401));
    }
    
    return async.waterfall([
        function(callback) {
            return User.findOne({
                _id: req.params.userId
            }).then((user) => {
                let newCollection = new Collection({
                    name: req.body.collection.name,
                    user: user.id
                });
                return callback(null, newCollection);
            }).catch((err) => {
                return callback(err);
            });
        }, function(newCollection, callback) {
            return Collection.create(newCollection, (err, collection) => {
                if(err) return callback(err);
                return callback(null, helpers.response(collection, "Successfully created user collection", 201));
            });
        }
    ], (error, response) => {
        if(error) {
            return next(error);
        }
        return res.json(response);
    });
});

// DELETE /:userId ****** need to add this *****

// // GET /:userId/collections - Get all user collections.
// router.get('/:userId/collections', TokenHandler.verifyUser, function(req, res, next) {
    
// });

// // GET /:userId/collections/:collectionId - Get specific collection from specified user.
// router.get('/:userId/collections/:collectionId', TokenHandler.verifyUser, function(req, res, next) {
    
// });

// // POST /:userId/collections/:collectionId/add - Add YesList to specific collection for user.
// router.post('/:userId/collections/:collectionId/add', TokenHandler.verifyUser, function(req, res, next) {
    
// });


module.exports = router;
