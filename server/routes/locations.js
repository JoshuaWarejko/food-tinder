const express = require('express');
const router = express.Router();
const Location = require('../models/location');
const helpers = require('../config/helpers');

if(process.env.NODE_ENV == "development") {
// GET / used to retrieve all locations
router.get('/', function(req, res, next) {
	Location.find({}).exec(function(err, locations) {
		if(err) return next(err);
		res.json(locations);
	})
});
}

// POST / used to post a new location
router.post('/', function(req, res, next) {
    if(req.body.id) {
        req.body.yelpId = req.body.id;
        delete req.body.id;
	}
	return Location.create(req.body, function(err, location) {
        if(err) return next(err);
		return res.status(201).json(helpers.response(location, "Successfully created location", 201));
	});
});

module.exports = router;