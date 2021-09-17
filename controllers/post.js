const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "FETCH POST SUCCESS",
        posts: posts,
      });
    })
    .catch((err) => console.log(err));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 500;
    error.data = errors.array();
    throw error;
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
    .catch((err) => console.log(err));
};
