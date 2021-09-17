const { validationResult } = require("express-validator");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    message: "FETCH POST SUCCESS",
    posts: [
      {
        title: "First Post",
        content: "This is the first post !",
      },
      {
        title: "Second Post",
        content: "This is the second post !",
      },
      {
        title: "Third Post",
        content: "This is the third post !",
      },
    ],
  });
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

  res.status(200).json({
    message: "CREATE POST SUCCESS",
    post: {
      title: title,
      content: content,
    },
  });
};
