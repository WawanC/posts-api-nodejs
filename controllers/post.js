const { validationResult } = require("express-validator");
const { createAsyncError, createError } = require("../utils/error");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "FETCH POST SUCCESS",
        posts: posts,
      });
    })
    .catch((err) => createAsyncError(err, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    createError(500, "Validation Failed", errors.array());
  }
  const title = req.body.title;
  const content = req.body.content;

  const newPost = new Post({
    title: title,
    content: content,
  });

  newPost
    .save()
    .then((result) => {
      res.status(200).json({
        message: "CREATE POST SUCCESS",
        post: result,
      });
    })
    .catch((err) => createAsyncError(err, next));
};
