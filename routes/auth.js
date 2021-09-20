const express = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

const signUpValidation = [
  body("username")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Username must be minimal 6 characters long"),
  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("Email already exists");
        }
      });
    })
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be minimal 6 characters long"),
];

router.put("/signup", signUpValidation, authController.signUp);
router.post("/login", authController.login);

module.exports = router;
