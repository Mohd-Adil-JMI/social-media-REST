const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const arrayUniquePlugin = require("mongoose-unique-array");
const Post = require("./post");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
      minlength: 7,
      validate(value) {
        if (value.length < 6) {
          throw new Error("Password is too short!");
        } else if (value == "password") {
          throw new Error("Password cannot be password!");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age is invalid!");
        }
      },
    },
    followers: [
      {
        username: {
          type: String,
          unique: true,
        },
      },
    ],
    followings: [
      {
        username: {
          type: String,
          unique: true,
        },
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual('posts',{
    ref: 'Post',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function () {
  const user = this;
  userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};
userSchema.methods.follow = async function (username) {
  const owner = this;
  if (owner.username === username) throw new Error("Bad request");
  const user = await User.findOne({ username });
  owner.followings = owner.followings.concat({ username });
  user.followers = user.followers.concat({ username: owner.username });
  await owner.save();
  await user.save();
  return owner;
};
userSchema.methods.unfollow = async function (username) {
  const owner = this;
  if (owner.username === username) throw new Error("Bad request");
  const user = await User.findOne({ username });
  owner.followings = owner.followings.filter((following) => {
    return following.username !== username;
  });
  user.followers = user.followers.filter((follower) => {
    return follower.username !== owner.username;
  });
  await owner.save();
  await user.save();
  return owner;
};
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
//delete user tasks when user is removed
userSchema.pre('remove', async function (next){
    const user=this
    await Post.deleteMany({owner:user._id})
    next()
})
userSchema.plugin(arrayUniquePlugin);
const User = mongoose.model("User", userSchema);

module.exports = User;
