// Basic error handling function.
function basicError(message, status) {
  var error = new Error();
  error.status = status;
  error.message = message;
  return error;
};

function callback(error, retval) {
  if(error) {
      return error;
  }
  return retval;
}

const helpers = {
  basicError: basicError,
  callback: callback
}

module.exports = helpers;