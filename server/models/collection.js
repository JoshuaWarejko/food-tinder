let mongoose = require('mongoose');
let async = require('async');

let CollectionSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	yesLists: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'YesList',
		required: true
    }],
    user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
    lastUpdated: { type: Date, required: true }
});

CollectionSchema.pre('validate', function(next) {
    let collection = this;
    return next();
});

CollectionSchema.pre('save', function(next) {
    let collection = this;
    return next();
});

const Collection = mongoose.model('Collection', CollectionSchema);
module.exports = Collection;