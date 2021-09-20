const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

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

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let signedUser;

  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        const error = createError(404, "User Not Found");
        throw error;
      }

      signedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = createError(500, "Password Not Match");
        throw error;
      }

      const token = jwt.sign(
        {
          username: signedUser.username,
        },
        "secretkey",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        message: "LOGIN SUCCESS",
        token: token,
      });
    })
    .catch((err) => createAsyncError(err, next));
};
