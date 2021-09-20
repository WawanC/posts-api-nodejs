const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { createAsyncError, createError } = require("../utils/error");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 2;

  Post.find()
    .skip((page - 1) * +perPage)
    .limit(+perPage)
    .then((posts) => {
      res.status(200).json({
        message: "FETCH POSTS SUCCESS",
        page: page,
        posts: posts,
      });
    })
    .catch((err) => createAsyncError(err, next));
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = createError(404, "Post Not Found");
        throw error;
      }
      res.status(200).json({
        message: "FETCH POST SUCCESS",
        post: post,
      });
    })
    .catch((err) => createAsyncError(err, next));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(500, "Validation Failed", errors.array());
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const image = req.file ? req.file.filename : null;
  let creator;

  const newPost = new Post({
    title: title,
    content: content,
    image: image,
    createdBy: req.userId,
  });

  newPost
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(newPost);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "CREATE POST SUCCESS",
        post: newPost,
      });
    })
    .catch((err) => createAsyncError(err, next));
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(500, "Validation Failed", errors.array());
    throw error;
  }

  const postId = req.params.postId;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  const updatedImage = req.file ? req.file.filename : null;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = createError(404, "Post Not Found");
        throw error;
      }

      if (post.createdBy.toString() != req.userId) {
        const error = createError(500, "Only Post Owner can edit this Post");
        throw error;
      }

      post.title = updatedTitle;
      post.content = updatedContent;
      if (updatedImage) {
        deleteImage(post.image);
        post.image = updatedImage;
      }
      return post.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "UPDATE POST SUCCESS",
        post: result,
      });
    })
    .catch((err) => createAsyncError(err, next));
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = createError(404, "Post Not Found");
        throw error;
      }

      if (post.createdBy.toString() != req.userId) {
        const error = createError(500, "Only Post Owner can delete this Post");
        throw error;
      }

      if (post.image) {
        deleteImage(post.image);
      }
      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      res.status(200).json({
        message: "DELETE POST SUCCESS",
        post: result,
      });
    })
    .catch((err) => createAsyncError(err, next));
};

const deleteImage = (imageName) => {
  const filePath = path.join(__dirname, "..", "images", imageName);
  fs.unlink(filePath, (err) => console.log(err));
};
