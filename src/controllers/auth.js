const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { secret } = require("../utilities/config");
const { hashPassword, comparePassword } = require("../utilities/hashPassword");
const User = require("../models/user");

const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const newUser = {
      username,
      email,
      password: hashPassword(password),
    };

    const alreadyExists = await User.exists({
      $or: [{ username }, { email }],
    });

    if (alreadyExists) {
      return res.status(400).json({ error: "user already exists" });
    }

    const user = new User(newUser);
    await user.save();

    // create jwt token
    delete user.password;
    delete user.posts;
    delete user.following;
    delete user.followers;

    const token = await jwt.sign({ user }, secret, { expiresIn: "30d" });

    res.status(201).json({ message: "signed up successfully", token });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  const username = req.body.username || false;
  const email = req.body.email || false;
  const password = req.body.password;

  if (!(username || email) || !password) {
    return res
      .status(400)
      .json({ error: "either username or email and password required" });
  }

  const filter = {
    $or: [{ username }, { email }],
  };

  const user = await User.findOne(filter)
    .select("_id username email password firstname lastname")
    .lean();
  if (!user) {
    return res.status(404).send({ error: "user not found" });
  }

  if (comparePassword(password, user.password)) {
    delete user.password;
    delete user.posts;
    delete user.followers;
    delete user.following;
    jwt.sign({ user }, secret, { expiresIn: "30d" }, (err, token) => {
      res.status(200).json({ message: "logged in", token });
    });
  } else {
    res.status(403).json({ err: "incorrect email or password" });
  }
});

module.exports = authRouter;
