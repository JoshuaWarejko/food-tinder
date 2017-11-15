const jwt = require('jsonwebtoken');
const helpers = require('./helpers');

module.exports = function TokenHandler() {
    
    // Checks for the JWT token in authorization header
    function verifyJwt(req, next) {
        let token;
        if(req.get('authorization')) {
            token = req.get('authorization').split(' ')[1];
        } else {
            token = req.body.token || req.query.token || req.headers['x-access-token'];
        }
        if(!token) {
            return next(helpers.basicError("No token provided", 401));
        }
        return jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {      
            if (err) {
                if(err.message == "jwt expired") {
                    return next(helpers.basicError("Token expired", 401));
                }
                return next(helpers.basicError("Failed to authenticate token", 401));
            }
            return decoded;
        });
    }
    
    // Middleware for decoding a token.
    function getDecodedToken(req, res, next) {
        req.decodedToken = verifyJwt(req, next);
        return next();
    }
    
    // Middleware for verifying that a user has permission to peform CRUD operations.
    function verifyUser(req, res, next) {
        
        let verifiedJwt;
        verifiedJwt = verifyJwt(req, next);
        if(req.params && req.params.userId) {
            if(req.params.userId != verifiedJwt.id) {
                return next(helpers.basicError("User not authorized to update resource", 403));
            }
            return next();
        }
        return next();
        
    }
    
    this.getDecodedToken = getDecodedToken;
    this.verifyUser = verifyUser;
    
}