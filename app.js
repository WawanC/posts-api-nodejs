const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const postRoutes = require("./routes/post");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(postRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(process.env.DB_URI)
  .then((result) => {
    console.log("Connected to DB");
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
