const express = require("express");
const auth = require("../middleware/auth");
const Post = require("../models/post");
const router = new express.Router();

router.post("/posts", auth, async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id,
  });
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
    res.send(req.user.posts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/posts/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const post = await Post.findOne({ _id, owner: req.user._id });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
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
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!post) {
      res.status(404).send();
    }
    updates.forEach((update) => (post[update] = req.body[update]));
    await post.save();
    res.send(post);
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
      res.status(404).send();
    }
    res.send(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
module.exports = router;
