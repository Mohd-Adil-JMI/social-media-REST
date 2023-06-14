// Import required modules
const express = require('express');
const router = new express.Router();
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

router.get('/feeds', auth, async (req, res) => {
  try {
    const followings = await Follow.find(
      { follower: req.user._id },
      'following'
    );
    const userIds = followings.map((following) => following.following);
    // Find posts from the users that the logged-in user is following
    const posts = await Post.find({ owner: { $in: userIds } })
      .populate('owner', ['name', 'username', 'avatar'])
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
