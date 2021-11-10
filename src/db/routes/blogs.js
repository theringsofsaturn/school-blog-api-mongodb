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

    if (deletedPost) {
      res.status(204).json({ message: "Post deleted" });
    } else {
      next(createError(404, `Post with _id ${postId} Not Found!`));
    }
  } catch (error) {
    console.log(error);
    next(createError(400, error.message));
  }
});

// *************** GET SPECIFIC POST ********************
mongoBlogPostsRouter.get("/find/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const blogPost = await BlogPost.findById(postId);
    if (!blogPost) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.status(200).json(blogPost);
    }
  } catch (error) {
    console.log(error);
    next(createError(500, "An Error ocurred while getting the post"));
  }
});

// *************** GET ALL BLOG POSTS ********************
mongoBlogPostsRouter.get("/", async (req, res) => {
  try {
    const query = q2m(req.query);

    const { total, posts } = await BlogPost.findPostsWithAuthors(query);
    res.send({ links: query.links("/mongoBlogPosts", total), total, posts });
  } catch (error) {
    console.log(error);
    next(createError(500, "An Error ocurred while getting the list of posts"));
  }
});

// *************** UPDATE ********************
mongoBlogPostsRouter.put("/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const updatedPost = await BlogPost.findByIdAndUpdate(
      postId,
      {
        $set: req.body,
      },
      { new: true }
    );

    if (updatedPost) {
      res.status(200).json(updatedPost);
    } else {
      next(createError(404, `Post with _id ${postId} not Found!`));
    }
  } catch (err) {
    if (error.name === "ValidationError") {
      next(createError(400, error));
    } else {
      next(
        createError(
          500,
          `An Error ocurred while updating the post ${req.params.postId}`
        )
      );
    }
  }
});

// *********************** COMMENTS ************************

// ************** CREATES NEW COMMENT IN A SPECIFIC BLOG POST **************

mongoBlogPostsRouter.post("/:postId/comments", async (req, res, next) => {
  try {
    const newComment = req.body;
    console.log(newComment);

    const postId = req.params.postId;
    const updatedPost = await BlogPost.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
      { new: true }
    );

    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(createError(404, `Post with _id ${postId} not Found!`));
    }
  } catch (error) {
    if (error.name === "validationError") {
      next(createError(400, error));
    } else {
      next(
        createError(
          500,
          `An Error ocurred while posting a comment on post ID: ${req.params.postId}`
        )
      );
    }
  }
});

// *************** GET LIST OF COMMENTS FOR A BLOG POST ********************
mongoBlogPostsRouter.get("/:postId/comments", async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const blog = await BlogPost.findById(postId);
    if (blog) {
      res.send(blog.comments);
    } else {
      next(createError(404, "blog not found"));
    }
  } catch (error) {
    next(createError(500, "Error while fetching comments "));
  }
});

// *************** GET SINGLE COMMENT ********************
mongoBlogPostsRouter.get(
  "/:postId/comments/:commentId",
  async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const commentId = req.params.postId;
      const blog = await BlogPost.findById(postId, {
        comments: {
          $elemMatch: {
            _id: commentId,
          },
        },
      });
      if (blog) {
        if (blog.comments.length > 0) {
          res.send(blog.comments[0]);
        } else {
          next(createError(404, `no comments found`));
        }
      } else {
        next(createError(404, `blog not found`));
      }
    } catch (error) {
      next(createError(500, "Error while fetching a single comment"));
    }
  }
);

// *************** DELETE A COMMENT FROM A BLOG POST ********************
mongoBlogPostsRouter.delete(
  "/:postId/comments/:commentId",
  async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const blogToDelete = await BlogPost.findById(postId, {
        comments: {
          $elemMatch: { _id: req.params.commentId },
        },
      });
      const blog = await BlogPost.findByIdAndUpdate(
        req.params.postId,
        {
          $pull: {
            comments: {
              _id: req.params.commentId,
            },
          },
        },
        {
          new: true,
        }
      );
      if (blog) {
        res.send(blogToDelete.comments[0]._doc);
      } else {
        next(createError(404, `blog not found`));
      }
    } catch (error) {
      next(createError(500, "Error while deleting a comment"));
    }
  }
);

export default mongoBlogPostsRouter;
