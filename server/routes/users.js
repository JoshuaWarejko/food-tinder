const express = require('express');
const router = express.Router();
const User = require('../models/users');

// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

router.post('/', (req, res) => {
    // Create object from input
    var userData = new User({
        name: req.body.name,
    });
    // use schema's create method to insert document into Mongo
    User.create(userData, (error, user) => {
        if(error) {
            return next(error);
        } else {
            return res.json(user);
        }
    });
})

// Get users
router.get('/', (req, res) => {
    User.find({}).then((users) => {
        response.data = users;
        res.json(response);
    }).catch((err) => {
        sendError(err, res);
    });
});

module.exports = router;
