const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const async = require('async');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const utilities = require('@adf/utilities');

let UserSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: "Email ({VALUE}) already in use", trim: true},
  password: { type: String, required: true, select: false },
  dateJoined: { type: Date, required: true },
  lastUpdated: { type: Date, required: true, default: new Date() },
  facebook: String
});

UserSchema.plugin(beautifyUnique);

// authenticate input against database documents
UserSchema.statics.authenticate = function(email, password, callback) {
	return User.findOne({ email: email }, '+password').exec(function (error, user) {
		if(error) {
			return callback(error);
		} else if (!user) {
			return callback(utilities.createError('User not found'), 401);
    }
		bcrypt.compare(password, user.password, function(error, result) {
			if(result === true) {
				return callback(null, user);
			} else {
				return callback();
			}
		});
	});
}

UserSchema.pre('validate', function(callback) {
  let user = this;
  if(user.isNew) {
    user.dateJoined = new Date();
  }
  user.lastUpdated = new Date();
  return callback();
});

UserSchema.pre('save', function(callback) {
  let user = this;
  
  return async.waterfall([
    function(callback) {
      // Parse email against against regex.
      if(!utilities.parseEmail(user.email)) {
        let error = new Error();
        error.status = 400;
        error.message = "Email invalid";
        return callback(error);
      }
      return callback();
    }, function(callback) {
      // Hash password before saving.
      if(user.isNew) {
        return bcrypt.hash(user.password, 10, function(err, hash) {
          if (err) {
            return callback(err);
          }
          user.password = hash;
          return callback();
        });
      }
      return callback();
    }
  ], function(error) {
    if(error) return callback(error);
    return callback();
  })
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
