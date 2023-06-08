const express = require("express");
const auth = require("../middleware/auth");
const uploadImage = require("../middleware/uploadImage");
const Post = require("../models/Post");
const Like = require("../models/Like");
const Comment = require("../models/Comment");
const router = new express.Router();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

router.post("/posts", uploadImage.single("image"), auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id,
  });
  if (req.file) {
    post.imageName = req.file.key;
  }
  try {
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/posts", auth, async (req, res) => {
  try {
    await req.user.populate({
      path: "posts",
    });
    for (let index in req.user.posts) {
      if (req.user.posts[index].imageName) {
        req.user.posts[index].imageUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: req.user.posts[index].imageName,
          }),
          { expiresIn: 60 }
        );
      }
    }
    res.status(200).json(req.user.posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const post = await Post.findOne({ _id });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.imageName) {
      post.imageUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: post.imageName,
        }),
        { expiresIn: 60 }
      );
    }
    res.status(200).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/posts/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedupdates = ["description"];
  const isValidOperation = updates.every((update) =>
    allowedupdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates!" });
  }
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
    }
    updates.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.status(200).json(post);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.delete("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.imageName) {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: post.imageName,
        })
      );
    }
    res.status(200).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/posts/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const like = new Like({ user: req.user._id, post: post._id });
    await like.save();
    res.status(201).json(like);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/posts/:id/unlike", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const like = await Like.findOneAndDelete({
      user: req.user._id,
      post: post._id,
    });
    if (!like) {
      return res.status(404).json({ error: "Like not found" });
    }
    res.status(201).json(like);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/posts/:id/likes", async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    await post.populate({ path: "likes" });
    res.status(200).json(post.likes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/posts/:id/comments", async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    await post.populate({ path: "comments" });
    res.status(200).json(post.comments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/posts/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = new Comment({
      ...req.body,
      user: req.user._id,
      post: post._id,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/posts/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      user: req.user._id,
      post: post._id,
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    res.status(200).json(comment);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
