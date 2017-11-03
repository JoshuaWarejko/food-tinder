let mongoose = require('mongoose');
let async = require('async');

let YesListSchema = new mongoose.Schema({
    identifier: { type: String, required: true, trim: true },
    listName: { type: String, required: true, trim: true },
    user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
    lastUpdated: { type: Date, required: true }
});

YesListSchema.pre('validate', function(next) {
    let yesList = this;
    return next();
});

YesListSchema.pre('save', function(next) {
    let yesList = this;
    return next();
});

const YesList = mongoose.model('YesList', YesListSchema);
module.exports = YesList;