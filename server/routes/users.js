const express = require('express');
const router = express.Router();
const User = require('../models/users');
const utilities = require('@adf/utilities');
const jwt = require('jsonwebtoken');
const tokenHandler = require('../config/token-handler');

const TokenHandler = new tokenHandler();

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

// POST / - route to create new users.
router.post('/', (req, res, next) => {
    
    if(!req.body.name) {
        return next(basicError("Name is required to create an account", 400)); 
    }
    if(!req.body.email) {
        return next(basicError("Email is required to create an account", 400));
    }
    if(!req.body.password) {
        return next(basicError("Password required to create an account", 400));
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
                return next(basicError(error.errors.email.message, 400));
            }
            return next(error);
        } else {
            return res.json({
                success: true,
                status: 200,
                data: {
                    id: user._id,
                    dateJoined: user.dateJoined,
                    name: user.name,
                    email: user.email,
                    lastUpdated: user.lastUpdated
                }
            });
        }
    });
});

// POST /authenticate - route to authenticate a user.
router.post('/authenticate', (req, res, next) => {
    
    if(!req.body.email || !req.body.password) {
        return next(basicError("Both email and password are required to login", 400));
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

if(process.env.NODE_ENV == "development") {
    // Get users
    router.get('/', (req, res, next) => {
        User.find({}).then((users) => {
            response.data = users;
            res.json(response);
        }).catch((err) => {
            return next(err);
        });
    });
}

// GET /:id - get user based on ID
router.get('/:id', TokenHandler.verifyUser, (req, res, next) => {
    if(!req.params.id) {
        return next(basicError("No user ID present in request url", 401));
    }
    return User.findOne({
        _id: req.params.id
    }).then((user) => {
        response.data = user;
        response.message = "Success";
        return res.json(response);
    }).catch((err) => {
        return next(err);
    });
});

// PUT /:id/update - update specific user.
router.put('/:id/update', TokenHandler.verifyUser, (req, res, next) => {
    if(!req.params.id) {
        return next(basicError("No user ID present in request url", 401));
    }
    return User.findOne({
        _id: req.params.id
    }).then((user) => {
        if(req.body.name) {
            user.set({ name: req.body.name });
        }
        if(req.body.email) {
            user.set({ email: req.body.email });
        }
        
        return user.save(function(err, updatedUser) {
            if(err) return next(err);
            response.data = updatedUser;
            response.message = "Successfully updated user";
            return res.json(response);
        });
        
    }).catch((err) => {
        return next(err);
    });
});

module.exports = router;
