const express = require("express");
const router = new express.Router();

router.get("/posts", (req, res) => {
  res.status(200).json({ message: "Post Router" });
});

module.exports = router;
