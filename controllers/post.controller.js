import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

//get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log(`Error in getAllPosts controller: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//create post
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = await Post.create({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    console.log(newPost);
    return res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in createPost controller: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//user posts
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPsts controller:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
//getLikedPosts
export const getLikedPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const likedPosts = await Post.find({ likes: userId })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    if (likedPosts.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log(`Error in getLikedPosts controller: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//getFollowing
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    console.log(user);

    const following = user.following;

    if (following.length === 0) {
      return res.status(200).json([]);
    }
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    console.log(feedPosts);
    return res.status(200).json(feedPosts);
  } catch (error) {
    console.log(`Error in getFollowing controller: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//like unlike post
export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      //unlike post

      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res.status(200).json(updatedLikes);
    } else {
      //like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = await Notification.create({
        from: userId,
        to: post.user,
        type: "like",
      });
      const updatedLikes = post.likes;

      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log(`Error in likeUnikePost controller: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

//comment on post
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: postId } = req.params;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text is required." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.log(`Error in commentOnPost controller: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

//delete post
export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (post.user._id.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this post." });
    }

    if (post.img) {
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.log(`Error in deletePost controller: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "Post not found." });

  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId.toString()
  );
  if (!comment) return res.status(404).json({ error: "Comment not found." });

  if (comment.user.toString() !== userId.toString())
    return res
      .status(400)
      .json({ error: "You are not authorized to delete this comment." });

  post.comments = post.comments.filter(
    (comment) => comment._id.toString() !== commentId
  );
  await post.save();
  return res.status(200).json({ message: "Comment deleted successfully." });
};


