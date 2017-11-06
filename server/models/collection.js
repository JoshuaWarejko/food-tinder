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

CollectionSchema.pre('validate', function(callback) {
	let collection = this;
	
	collection.lastUpdated = new Date();
	return callback();

});

CollectionSchema.pre('save', function(callback) {
    let collection = this;
    return callback();
});

const Collection = mongoose.model('Collection', CollectionSchema);
module.exports = Collection;