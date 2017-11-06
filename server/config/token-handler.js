const jwt = require('jsonwebtoken');
const helpers = require('./helpers');

module.exports = function TokenHandler() {

    function callback(error, retval) {
        if(error) {
            return error;
        }
        return retval;
    }
    
    function verifyJwt(req, callback) {
        let token;
        if(req.get('authorization')) {
            token = req.get('authorization').split(' ')[1];
        } else {
            token = req.body.token || req.query.token || req.headers['x-access-token']
        }
        if(!token) {
            return callback(helpers.basicError("No token provided", 401));
        }
        return jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {      
            if (err) {
                if(err.message == "jwt expired") {
                    return callback(helpers.basicError("Token expired", 401));
                }
                return callback(helpers.basicError("Failed to authenticate token", 401));
            }
            // if everything is good, save to request for use in other routes
            return callback(null, decoded);
        });
    }
    
    // Middleware for decoding a token.
    function getToken(req, res, next) {

        req.decodedToken = verifyJwt(req, callback);
        return next();
        
    }
    
    function verifyUser(req, res, next) {

        let verifiedJwt;
        return verifyJwt(req, function(error, verifiedJwt) {
            if(error) {
                return next(error);
            }
            if(req.params && req.params.id) {
                if(req.params.id != verifiedJwt.id) {
                    return next(helpers.basicError("User not authorized to update resource", 403));
                }
                return next();
            }
            return next();
        });
        
    }
    
    this.getToken = getToken;
    this.verifyUser = verifyUser;
    
}