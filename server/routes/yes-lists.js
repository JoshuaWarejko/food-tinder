const express = require('express');
const router = express.Router();
const helpers = require('../config/helpers');
const async = require('async');
const User = require('../models/users');
const YesList = require('../models/yes-list');
const Location = require('../models/location');
const tokenHandler = require('../config/token-handler');

const TokenHandler = new tokenHandler();

if(process.env.NODE_ENV == "development") {
    // Get users
    router.get('/', (req, res, next) => {
        YesList.find({}).then((lists) => {
            return res.json(helpers.response(lists, "Successfully retrieved Yes Lists", 200));
        }).catch((err) => {
            return next(err);
        });
    });
}

router.post('/', TokenHandler.getDecodedToken, function(req, res, next) {
    if(!req.decodedToken || !req.decodedToken.id) {
        return next(helpers.basicError("No authorized user found to create list", 401));
    }
    
    if(!req.body.name) {
        return next(helpers.basicError("List name required to create list", 401));
    }

    if(!req.body.identifier) {
        return next(helpers.basicError("Identifier required to create list", 401));
    }

    if(!req.body.locations || req.body.locations.length == 0) {
        return next(helpers.basicError("Locations required to create list", 401));
    }


    return async.waterfall([
        function(callback) {
            // Find authenticated user with id.
            return User.findOne({
                _id: req.decodedToken.id
            }).then((user) => {
                return callback(null, user);
            }).catch((err) => {
                return callback(err);
            });
        }, function(user, callback) {
            // Search all locations in req.body.locations. If location already exists in DB, pull the _id and add to new results.
            // If location does not already exist, create it and grab ID.
            return async.mapSeries(req.body.locations, function(reqLocation, callback) {
                return Location.findOne({
                    yelpId: reqLocation.id
                }).then((location) => {
                    if(!location) {
                        if(reqLocation.id) {
                            reqLocation.yelpId = reqLocation.id;
                            delete reqLocation.id;
                        }
                        // **** Add check for if user already has location in list **** //
                        return Location.create(reqLocation, (error, location) => {
                            if(error) return callback(error);
                            console.log("Creating new location...");
                            return callback(null, location._id);
                        });
                    }
                    return callback(null, location._id);
                }).catch((error) => {
                    if(error) return callback(error);
                });
            }, function(error, locations) {
                if(error) return callback(error);
                return callback(null, user, locations);
            });
        }, function(user, locations, callback) {
            let newList = new YesList({
                identifier: req.body.identifier,
                name: req.body.name,
                locations: locations,
                user: user.id
            });
            return YesList.create(newList, (err, list) => {
                if(err) return callback(err);
                return callback(null, helpers.response(list, "Successfully created user list", 201));
            });
        }
    ], (error, response) => {
        if(error) {
            return next(error);
        }
        return res.status(201).json(response);
    });
});

// GET /user-lists - return all of the authenticated user's lists.
router.get('/user-lists', TokenHandler.getDecodedToken, function(req, res, next) {
    if(!req.decodedToken) {
        return next(helpers.basicError("No token found", 401));
    }
    return YesList.find({
        user: req.decodedToken.id
    }).then((lists) => {
        return res.status(200).json(helpers.response(lists, "Successfully retrieved user's lists", 200));
    }).catch((error) => {
        return next(error);
    });
});

// PUT /:yesListId - update a user's list.
router.put('/:yesListId', TokenHandler.getDecodedToken, function(req, res, next) {
    
});

// DELETE /:yesListId - delete a list by ID after verifying that the owner is the one making the request.
router.delete('/:yesListId', TokenHandler.getDecodedToken, function(req, res, next) {
    return YesList.findOne({
        _id: req.params.yesListId
    }).then((list) => {
        if(!list) return next(helpers.basicError("List not found", 400));
        if(list.user != req.decodedToken.id) return next(helpers.basicError("User not authorized to remove list", 403));
        return YesList.remove({_id: req.params.yesListId}, (error) => {
            if(error) return next(error);
            return res.status(200).json(helpers.response(list, "List successfully delete", 200));
        });
    }).catch((error) => {
        return next(error);
    });
});


module.exports = router;