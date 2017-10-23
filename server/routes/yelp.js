const express = require('express');
const router = express.Router();
const yelp = require('yelp-fusion');
const clientId = 'BP5bDiqYdkDgtHDczeF8Mw';
const clientSecret = 'pMOg6nkzBdyCMhtPziAT6kSBHXbq4wfrjOnx15Klo0nEp44lDTD3YJfZZ07zK6Lp';

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

yelp.accessToken(clientId, clientSecret).then(response => {
	const client = yelp.client(response.jsonBody.access_token);

  // Get businesses based on search query parameters
  router.get('/', (req, res, next) => {
    const searchRequest = {};
    searchRequest.term = 'food';
    if(req.query.term && req.query.term !== undefined) {
      searchRequest.term = req.query.term;
    }
    if(req.query.latitude && req.query.latitude !== undefined && req.query.longitude && req.query.longitude !== undefined) {
      searchRequest.latitude = req.query.latitude;
      searchRequest.longitude = req.query.longitude;
    } else {
      searchRequest.location = req.query.location;
    }
  	client.search(searchRequest).then(response => {
  		res.json(response.jsonBody);
  	}).catch(e => {
  		return next(e.response.body);
  	});
  });

  // Get businesses based on search query parameters
  router.get('/business', (req, res, next) => {
    
    if(req.query.id) {
      client.business(req.query.id).then(response => {
        res.json(response.jsonBody);
      }).catch(e => {
        return next(e.response.body);
      });
    } else {
      return res.status(401).send("Business ID required");
    }
  });

}).catch(e => {
  return next(e);
});


module.exports = router;