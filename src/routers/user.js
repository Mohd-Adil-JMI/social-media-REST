const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const User = require("../models/user");
router.get("/users", (req, res) => {
  res.status(200).json({ message: "User Router" });
});
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    console.log(user);
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.json(req.user);
});

router.get("/users/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/users/:username/followers", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    const followers = user.followers;
    res.status(200).json(followers);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/users/:username/followings", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    const followings = user.followings;
    res.status(200).json(followings);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/users/:username/follow", auth, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await req.user.follow(username);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/users/:username/follow", auth, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await req.user.unfollow(username);
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send;
  }
});
module.exports = router;
