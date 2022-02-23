const userRouter = require("./users");
const postRouter = require("./posts");
const authRouter = require("./auth");
const feedRouter = require("./feed");
const publicRouter = require("./public");

module.exports = {
  userRouter,
  postRouter,
  authRouter,
  feedRouter,
  publicRouter,
};
