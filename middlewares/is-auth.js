const jwt = require("jsonwebtoken");
const { createError, createAsyncError } = require("../utils/error");

module.exports = (req, res, next) => {
  const token = req.get("Authorization");
  if (!token) {
    const error = createError(500, "No Auth Token Provided");
    throw error;
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secretkey");
  } catch (err) {
    const error = createError(500, "Auth Token is Invalid");
    throw error;
  }

  if (!decodedToken) {
    const error = createError(500, "Auth Token is Invalid");
    throw error;
  }

  req.userId = decodedToken.userId;
  next();
};
