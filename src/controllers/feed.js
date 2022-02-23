const Router = require("express").Router;
const User = require("../models/user");
const Post = require("../models/post");
const feedRouter = Router();

feedRouter.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const postsPerPage = 20;
    const skipPosts = (page - 1) * postsPerPage;

    const loggedInUser = await User.findById(req.id).select("following").lean();

    if (!loggedInUser) {
      return res.status(404).json({ error: "user not found" });
    }

    const feedPosts = await Post.aggregate([
      {
        $match: {
          postedBy: { $in: loggedInUser.following },
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
      {
        $sort: {
          createdAt: -1,
          likes: -1,
        },
      },
      {
        $skip: skipPosts,
      },
      {
        $limit: postsPerPage,
      },
    ]);

    return res.status(200).json(feedPosts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = feedRouter;
