const express = require("express");
const auth = require("../middleware/auth");
const router = new express.Router();
const User = require("../models/User");
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
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.json(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedupdates = ["name", "username", "email", "age"];
  const isValidOperation = updates.every((update) =>
    allowedupdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({ error: "Invalid updates!" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.json(req.user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.patch("/users/me/change-password", auth, async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.user.username,
      req.body.oldPassword
    );
    user.password = req.body.newPassword;
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
router.get("/users/me/liked", auth, async (req, res) => {
  try {
    await req.user.populate({ path: "liked" });
    res.json(req.user.liked);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/users/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ error: 'User not found' })
    res.status(200).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/users/:username/followers", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    await user.populate({ path: "followers" });
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
    await user.populate({ path: "followings" });
    const followings = user.followings;
    res.status(200).json(followings);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/users/:username/follow", auth, async (req, res) => {
  const username = req.params.username;
  try {
    const follow = await req.user.follow(username);
    res.status(200).json({ user: req.user, follow });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/users/:username/unfollow", auth, async (req, res) => {
  const username = req.params.username;
  try {
    const follow = await req.user.unfollow(username);
    res.status(200).json({ user: req.user, follow });
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
    res.json({ message: "Logout successfully"});
  } catch (e) {
    res.status(500).json({ error: e.message});
  }
});

router.post("/users/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.json({ message: "Logout successfully"});
  } catch (e) {
    res.status(500).json({ error: e.message});
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.json(req.user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
module.exports = router;
