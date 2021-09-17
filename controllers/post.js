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
