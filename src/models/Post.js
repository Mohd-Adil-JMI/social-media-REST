const mongoose = require('mongoose');
const Like = require('./Like');
const postSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageName: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

postSchema.virtual('likes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'post',
});

postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
});
postSchema.pre('remove', async function (next) {
  const post = this;
  await Like.deleteMany({ post: post._id });
  await Comment.deleteMany({ post: post._id });
  next();
});
const Post = mongoose.model('Post', postSchema);
module.exports = Post;
