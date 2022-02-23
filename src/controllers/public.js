const Router = require("express").Router;
const ObjectId = require("mongodb").ObjectId;
const Post = require("../models/post");
const User = require("../models/user");

const publicRouter = Router();

// get user profile by username
publicRouter.get("/profile/:username", async (req, res) => {
  try {
    const username = req.params.username;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const user = await User.aggregate([
      {
        $match: {
          username,
        },
      },
      {
        $project: {
          username: 1,
          firstname: 1,
          lastname: 1,
          followers: { $size: "$followers" },
          following: { $size: "$following" },
        },
      },
    ]);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    return res.status(200).json(user[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// get a single post
publicRouter.get("/post/view/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ error: "post id is required" });
    }

    const post = await Post.aggregate([
      {
        $match: {
          _id: ObjectId(postId),
        },
      },
      {
        $project: {
          post_caption: 1,
          postedBy: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: { $size: "$likes" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $project: {
          postedBy: 0,
        },
      },
      {
        $unwind: "$author",
      },
      {
        $project: {
          "author.password": 0,
          "author.email": 0,
          "author.posts": 0,
          "author.__v": 0,
          "author.following": 0,
          "author.followers": 0,
          "author.createdAt": 0,
          "author.updatedAt": 0,
        },
      },
    ]);

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }
    return res.status(200).json(post[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// get all posts by a user
publicRouter.get("/post/all/:username", async (req, res) => {
  try {
    const username = req.params.username;

    if (!username) {
      return res.status(400).json({ error: "username is required" });
    }

    const user = await User.findOne({ username }).select("_id").lean();
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const posts = await Post.aggregate([
      {
        $match: {
          postedBy: user._id,
        },
      },
      {
        $project: {
          post_caption: 1,
          createdAt: 1,
          updatedAt: 1,
          likes: { $size: "$likes" },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = publicRouter;
