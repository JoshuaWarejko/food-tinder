var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({}, {strict: false});

var Location = mongoose.model('Location', LocationSchema);
module.exports = Location;