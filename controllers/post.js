const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const { createAsyncError, createError } = require("../utils/error");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 2;

  try {
    const posts = await Post.find()
      .skip((page - 1) * +perPage)
      .limit(+perPage);

    res.status(200).json({
      message: "FETCH POSTS SUCCESS",
      page: page,
      posts: posts,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = createError(404, "Post Not Found");
      throw error;
    }
    res.status(200).json({
      message: "FETCH POST SUCCESS",
      post: post,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(500, "Validation Failed", errors.array());
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const image = req.file ? req.file.filename : null;

  const newPost = new Post({
    title: title,
    content: content,
    image: image,
    createdBy: req.userId,
  });

  try {
    await newPost.save();
    const user = await User.findById(req.userId);
    user.posts.push(newPost);
    await user.save();
    res.status(200).json({
      message: "CREATE POST SUCCESS",
      post: newPost,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = createError(500, "Validation Failed", errors.array());
    throw error;
  }

  const postId = req.params.postId;
  const updatedTitle = req.body.title;
  const updatedContent = req.body.content;
  const updatedImage = req.file ? req.file.filename : null;

  try {
    const post = await Post.findById(postId);
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

    const updatedPost = await post.save();

    res.status(200).json({
      message: "UPDATE POST SUCCESS",
      post: updatedPost,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

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

    const deletedPost = await Post.findByIdAndDelete(postId);

    res.status(200).json({
      message: "DELETE POST SUCCESS",
      post: deletedPost,
    });
  } catch (err) {
    createAsyncError(err, next);
  }
};

const deleteImage = (imageName) => {
  const filePath = path.join(__dirname, "..", "images", imageName);
  fs.unlink(filePath, (err) => console.log(err));
};
