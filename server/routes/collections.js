const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Collection = require('../models/collection');
const utilities = require('@adf/utilities');
const tokenHandler = require('../config/token-handler');
const helpers = require('../config/helpers');
const async = require('async');

const TokenHandler = new tokenHandler();

if(process.env.NODE_ENV == "development") {
    // Get collections
    router.get('/', function(req, res, next) {
        Collection.find({}).then((collections) => {
            return res.json(helpers.response(collections, "Successfully retrieved collections"));
        }).catch((err) => {
            return next(err);
        });
    });
}

// POST / - Create new collection with authenticated user.
router.post('/', TokenHandler.getDecodedToken, function(req, res, next) {
    if(!req.decodedToken || !req.decodedToken.id) {
        return next(helpers.basicError("No authorized user found to create collection", 401));
    }
    
    if(!req.body.name) {
        return next(helpers.basicError("Collection name required to create collection", 401));
    }

    return async.waterfall([
        function(callback) {
            return User.findOne({
                _id: req.decodedToken.id
            }).then((user) => {
                let newCollection = new Collection({
                    name: req.body.name,
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
        return res.status(201).json(response);
    });

});

// GET /user-collections - Get a user's collections based on authenticated user.
router.get('/user-collections', TokenHandler.getDecodedToken, function(req, res, next) {
    if(!req.decodedToken) {
        return next(helpers.basicError("No token found", 401));
    }
    return Collection.find({
        user: req.decodedToken.id
    }).then((collections) => {
        return res.status(200).json(helpers.response(collections, "Successfully retrieved user's collections", 200));
    }).catch((error) => {
        return next(error);
    });
});

// PUT /:collectionId - Update the name of a collection after verifying that the owner is making the request.
router.put('/:collectionId', TokenHandler.getDecodedToken, function(req, res, next) {
    if(!req.body.name) {
        return next(helpers.basicError("Must pass new name", 401));
    }

    return async.waterfall([
        function(callback) {
            return Collection.findOne({
                _id: req.params.collectionId
            }).then((collection) => {
                if(!collection) return next(helpers.basicError("Collection not found", 400));
                if(collection.user != req.decodedToken.id) return callback(helpers.basicError("User not authorized to updated collection", 401));
                return callback(null, collection);
            }).catch((error) => {
                if(error) return callback(error);
            }) 
        }, function(collection, callback) {
            collection.set({name: req.body.name});
            collection.save(function(error, updatedCollection) {
                if(error) return callack(error);
                return callback(null, helpers.response(updatedCollection, "Successfully updated collection", 200));
            });
        }
    ], (error, response) => {
        if(error) return next(error);
        return res.status(200).json(response);
    });

});

// DELETE /:collectionId - delete a collection by ID after verifying that the owner is the one making the request.
router.delete('/:collectionId', TokenHandler.getDecodedToken, function(req, res, next) {
    return Collection.findOne({
        _id: req.params.collectionId
    }).then((collection) => {
        if(!collection) return next(helpers.basicError("Collection not found", 400));
        if(collection.user != req.decodedToken.id) return next(helpers.basicError("User not authorized to remove collection", 403));
        return Collection.remove({_id: req.params.collectionId}, (error) => {
            if(error) return next(error);
            return res.status(200).json(helpers.response(collection, "Collection successfully delete", 200));
        });
    }).catch((error) => {
        return next(error);
    });
});


module.exports = router;