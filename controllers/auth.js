const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const { createError, createAsyncError } = require("../utils/error");

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(500, "Validation Failed", errors.array());
    throw error;
  }

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const newUser = new User({
        username: username,
        email: email,
        password: hashedPw,
      });

      return newUser.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "USER SIGNUP SUCCESS",
        user: result,
      });
    })
    .catch((err) => createAsyncError(err, next));
};
