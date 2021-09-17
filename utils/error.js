exports.createAsyncError = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

exports.createError = (statusCode, message, data) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  return error;
};
