const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const User = require("../models/user");
const userRouter = express.Router();

userRouter.get("/profile", async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $project: {
          username: 1,
          firstname: 1,
          lastname: 1,
          email: 1,
          followers: { $size: "$followers" },
          following: { $size: "$following" },
        },
      },
      {
        $match: {
          _id: ObjectId(req.id),
        },
      },
    ]);

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// update user profile
userRouter.put("/profile", async (req, res) => {
  try {
    const id = req.id;
    const userDetails = req.body;

    // basic details
    const firstname = userDetails?.firstname || "";
    const lastname = userDetails?.lastname || "";

    const update = {
      $set: {
        // basic details
        firstname,
        lastname,
      },
    };

    await User.findOneAndUpdate({ id }, update);
    return res.status(201).json({ message: "profile updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

userRouter.post("/follow/:id", async (req, res) => {
  try {
    const userToFollowId = req.params.id;

    if (userToFollowId === req.id) {
      return res.status(400).json({ error: "cannot follow yourself" });
    }

    const [userToFollow, loggedInUser] = await Promise.all([
      User.findById(userToFollowId),
      User.findById(req.id),
    ]);

    if (!userToFollow) {
      return res.status(404).json({ error: "user not found" });
    }

    const alreadyFollows = loggedInUser.following.find(
      (id) => id.toString() === userToFollowId
    );

    if (alreadyFollows) {
      return res.status(400).json({ error: "user is already followed" });
    }

    userToFollow.followers.push(loggedInUser);
    loggedInUser.following.push(userToFollow);

    await Promise.all([userToFollow.save(), loggedInUser.save()]);

    return res.status(200).json({
      message: `user followed`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

userRouter.post("/unfollow/:id", async (req, res) => {
  try {
    const userToUnfollowId = req.params.id;

    // cannot unfollow yourself
    if (userToUnfollowId === req.id) {
      return res.status(400).json({ error: "cannot unfollow yourself" });
    }

    const [userToUnfollow, loggedInUser] = await Promise.all([
      User.findById(userToUnfollowId),
      User.findById(req.id),
    ]);

    if (!userToUnfollow) {
      return res.status(404).json({ error: "user not found" });
    }

    const doesFollow = loggedInUser.following.find(
      (id) => id.toString() === userToUnfollowId
    );

    if (!doesFollow) {
      return res.status(400).json({ error: "no such user in following" });
    }

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.id
    );
    loggedInUser.following = loggedInUser.following.filter(
      (id) => id.toString() !== userToUnfollowId
    );

    await Promise.all([userToUnfollow.save(), loggedInUser.save()]);

    return res.status(200).json({
      message: `user unfollowed`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

userRouter.get("/followers", async (req, res) => {
  try {
    const userFollowers = await User.findById(req.id)
      .populate("followers", "_id username firstname lastname")
      .lean();

    return res.status(200).json(userFollowers.followers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

userRouter.get("/following", async (req, res) => {
  try {
    const userFollowing = await User.findById(req.id)
      .populate("following", "_id username firstname lastname")
      .lean();

    return res.status(200).json(userFollowing.following);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = userRouter;
