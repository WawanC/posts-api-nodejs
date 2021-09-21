const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { createError, createAsyncError } = require("../utils/error");

exports.signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(500, "Validation Failed", errors.array());
    throw error;
  }

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPw,
    });
    const result = await newUser.save();
    res.status(200).json({
      message: "USER SIGNUP SUCCESS",
      user: result,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};

exports.login = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      const error = createError(404, "User Not Found");
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = createError(500, "Password Not Match");
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "LOGIN SUCCESS",
      token: token,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};
