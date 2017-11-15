let mongoose = require('mongoose');
let async = require('async');

let YesListSchema = new mongoose.Schema({
    identifier: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    locations: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Location',
		required: true
	}],
    user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
    lastUpdated: { type: Date, required: true }
});

YesListSchema.pre('validate', function(next) {
    let yesList = this;

    yesList.lastUpdated = new Date();
    return next();
});

YesListSchema.pre('save', function(next) {
    let yesList = this;
    return next();
});

module.exports = mongoose.model('YesList', YesListSchema);;