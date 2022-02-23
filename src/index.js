const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const { PORT } = require("./utilities/config");
const { connectDB } = require("./utilities/connectDB");
const { verifyToken } = require("./utilities/verifyToken");
const {
  userRouter,
  authRouter,
  postRouter,
  feedRouter,
  publicRouter,
} = require("./controllers");
const {
  publicRateLimiter,
  authRateLimiter,
  loginSignupLimiter,
} = require("./utilities/rateLimiters");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(compression());

app.use(cors());
app.options("*", cors());

connectDB();

// routers
app.use("/auth", loginSignupLimiter, authRouter);
app.use("/public", publicRateLimiter, publicRouter);

app.use(verifyToken);
// authenticated routes below
app.use("/user", authRateLimiter, userRouter);
app.use("/post", authRateLimiter, postRouter);
app.use("/feed", authRateLimiter, feedRouter);

app.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});
