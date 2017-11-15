const express = require('express');
const router = express.Router();
const yelp = require('yelp-fusion');
const helpers = require('../config/helpers');
const clientId = 'BP5bDiqYdkDgtHDczeF8Mw';
const clientSecret = 'pMOg6nkzBdyCMhtPziAT6kSBHXbq4wfrjOnx15Klo0nEp44lDTD3YJfZZ07zK6Lp';

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
  	return client.search(searchRequest).then(response => {
  		return res.json(helpers.response(response.jsonBody, "Successfully returned locations", 200));
  	}).catch(e => {
  		return next(e.response.body);
  	});
  });

  // Get businesses based on search query parameters
  router.get('/business', (req, res, next) => {
    
    if(req.query.id) {
      return client.business(req.query.id).then(response => {
        return res.json(helpers.response(response.jsonBody, "Successfully returned business", 200));
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