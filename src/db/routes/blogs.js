import express from "express";
import createError from "http-errors";
import BlogPost from "../models/BlogPost.js";
import q2m from "query-to-mongo";

const mongoBlogPostsRouter = express.Router();

// ************ CREATE NEW BLOG POST ************
mongoBlogPostsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new BlogPost(req.body);
    const { _id } = await newPost.save();

    res.status(201).json({ _id });
  } catch (error) {
    console.log(error);
    next(createError(400, error.message));
  }
});

// *************** DELETE ********************
mongoBlogPostsRouter.delete("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const deletedPost = await BlogPost.findByIdAndDelete(postId);
    if (!deletedPost) {
      res.status(404).json({ message: "Post not found" });
    } else {
      next(createError(404, `Post with _id ${postId} Not Found!`));
    }
  } catch (error) {
    console.log(error);
    next(createError(400, error.message));
  }
});

// *************** GET SPECIFIC POST ********************
mongoBlogPostsRouter.get("/find/:id", async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);
    res.status(200).json(blogPost);
  } catch (error) {
    console.log(error);
    next(createError(400, error.message));
  }
});

// *************** GET ALL BLOG POSTS ********************
// if no query is sent, is just gonna return ALL posts. But if you add for example "/?new=true", is gonna return only last 10 posts
mongoBlogPostsRouter.get("/find/:id", async (req, res, next) => {
  const query = req.query.new; // (or new posts) new is the key
  try {
    // if there is a query (which means if we are fetching only new blogs), is gonna fetch only last 10 posts
    // if there is no query, is gonna fetch all posts
    const allPosts = query
      ? await BlogPost.find().sort({ _id: -1 }).limit(10)
      : await BlogPost.find();
    res.status(200).json(allPosts);
  } catch (error) {
    console.log(error);
    next(createError(400, error.message));
  }
});

// *************** UPDATE ********************
mongoBlogPostsRouter.put("/:id", async (req, res) => {
  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default mongoBlogPostsRouter;
