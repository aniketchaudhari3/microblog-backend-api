const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const Post = require("../models/post");
const User = require("../models/user");
const postRouter = express.Router();

postRouter.post("/create", async (req, res) => {
  try {
    const { post_caption } = req.body;

    if (!post_caption) {
      return res.status(400).json({ error: "post caption is required" });
    }

    const post = new Post({
      postedBy: req.id,
      post_caption,
    });

    const addPost = {
      $push: {
        posts: post,
      },
    };

    await Promise.all([post.save(), User.findByIdAndUpdate(req.id, addPost)]);

    return res.status(201).json({ message: "post created" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

postRouter.get("/all", async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $match: {
          postedBy: ObjectId(req.id),
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

// update post by id
postRouter.put("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const { post_caption } = req.body;
    const post = await Post.findById(postId).lean();

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    if (post.postedBy.toString() !== req.id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    if (!post_caption) {
      return res.status(400).json({ error: "post caption is required" });
    }

    const update = {
      $set: {
        post_caption,
      },
    };

    await Post.findByIdAndUpdate(postId, update);
    return res.status(201).json({ message: "post updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// delete post by id
postRouter.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).lean();

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    if (post.postedBy.toString() !== req.id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const loggedInUser = await User.findById(req.id);

    loggedInUser.posts = loggedInUser.posts.filter(
      (post) => post._id.toString() !== postId
    );

    await Promise.all([Post.findByIdAndDelete(postId), loggedInUser.save()]);

    return res.status(200).json({ message: "post deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// like a post
postRouter.post("/like/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ error: "post id is required" });
    }

    const post = await Post.findById(postId).lean();

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    const hasAlreadyLiked = post.likes.find(
      (userId) => userId.toString() === req.id
    );

    if (hasAlreadyLiked) {
      return res.status(400).json({ error: "post already liked" });
    }

    const update = {
      $push: {
        likes: req.id,
      },
    };

    await Post.findByIdAndUpdate(postId, update);
    return res.status(201).json({ message: "post liked" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

postRouter.post("/unlike/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    if (!postId) {
      return res.status(400).json({ error: "post id is required" });
    }

    const post = await Post.findById(postId).lean();

    if (!post) {
      return res.status(404).json({ error: "post not found" });
    }

    const hasAlreadyLiked = post.likes.find(
      (userId) => userId.toString() === req.id
    );

    if (!hasAlreadyLiked) {
      return res
        .status(400)
        .json({ error: "cannot unlike a post that is not liked" });
    }

    const update = {
      $pull: {
        likes: {
          _id: req.id,
        },
      },
    };

    await Post.findByIdAndUpdate(postId, update);
    return res.status(201).json({ message: "post unliked" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// get users who liked a post
postRouter.get("/likes/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const users = await Post.findById(postId)
      .select("likes -_id")
      .populate("likes", "firstname lastname username")
      .lean();

    if (!users) {
      return res.status(404).json({ error: "post not found" });
    }

    return res.status(200).json(users.likes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = postRouter;
