const rateLimit = require("express-rate-limit");

const loginSignupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
});

const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250,
});

module.exports = {
  publicRateLimiter,
  authRateLimiter,
  loginSignupLimiter,
};
