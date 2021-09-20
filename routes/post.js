const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middlewares/is-auth");

const postController = require("../controllers/post");

const postValidation = [
  body("title")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Post title must be minimal 5 characters long!"),
  body("content")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Post content must be minimal 10 characters long!"),
];

const router = express.Router();

router.get("/posts", postController.getPosts);
router.get("/post/:postId", postController.getPost);
router.post("/post", isAuth, postValidation, postController.createPost);
router.put("/post/:postId", isAuth, postValidation, postController.updatePost);
router.delete("/post/:postId", isAuth, postController.deletePost);

module.exports = router;
