const express = require('express');
const router = express.Router();
const User = require('../models/users');
const YesList = require('../models/yes-list');
const jwt = require('jsonwebtoken');

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

// Basic error handling function.
function basicError(message, status) {
    var error = new Error();
    error.status = status;
    error.message = message;
	return error;
};

if(process.env.NODE_ENV == "development") {
    // Get users
    router.get('/', (req, res, next) => {
        YesList.find({}).then((lists) => {
            response.data = lists;
            res.json(response);
        }).catch((err) => {
            return next(err);
        });
    });
}

module.exports = router;