var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({}, {strict: false});

LocationSchema.pre('save', function(next) {
    let location = this;

    return next();
});

module.exports = mongoose.model('Location', LocationSchema);