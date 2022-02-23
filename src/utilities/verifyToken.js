const jwt = require("jsonwebtoken");
const { secret } = require("./config");

const getAuthTokenFromHeaders = (bearerHeader) => {
  const bearer = bearerHeader.split(" ");
  const bearerToken = bearer[1];
  return bearerToken;
};

function verifyToken(req, res, next) {
  //get auth header
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    req.token = getAuthTokenFromHeaders(bearerHeader);

    // verify and next middleware
    jwt.verify(req.token, secret, (err, authData) => {
      if (err) return res.sendStatus(403);
      req.id = authData.user._id; // request will contain the authenticated user's id in the id field
      next();
    });
  } else {
    res.sendStatus(403);
  }
}
module.exports = { verifyToken };
