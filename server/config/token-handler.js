const jwt = require('jsonwebtoken');

// Basic error handling function.
function basicError(message, status) {
    var error = new Error();
    error.status = status;
    error.message = message;
    return error;
};

module.exports = function TokenHandler() {
    
    function verifyJwt(req, next) {
        let token;
        console.log(req);
        if(req.get('authorization')) {
            token = req.get('authorization').split(' ')[1];
        } else {
            token = req.body.token || req.query.token || req.headers['x-access-token']
        }
        if(!token) {
            return next(basicError("No token provided", 401));
        }

        return jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded) {      
            if (err) {
                return next(basicError("Failed to authenticate token.", 401));    
            }
            // if everything is good, save to request for use in other routes
            return decoded;
        });
    }
    
    // Middleware for decoding a token.
    function getToken(req, res, next) {

        req.decodedToken = verifyJwt(req, next);
        return next();
        
    }
    
    function verifyUser(req, res, next) {
        // if everything is good, save to request for use in other routes
        if(req.params && req.params.id) {
            if(req.params.id != verifyJwt(req, next).id) {
                return next(basicError("User not authorized to update resource", 403));
            }
            return next();
        }
        return next();
        
    }
    
    this.getToken = getToken;
    this.verifyUser = verifyUser;
    
}