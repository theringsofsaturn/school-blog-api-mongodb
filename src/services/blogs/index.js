import express from "express";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import {
  readBlogPosts,
  writeBlogPosts,
  readAuthors,
  saveCoverCloudinary,
} from "../../../src/lib/fs-tools.js";

import {
  getBlogPostPDFReadableStream,
  generateBlogPostPDFAsync,
} from "../../lib/pdfMakeTools.js";
import { pipeline } from "stream";
// import { sendEmail } from "../../lib/emailMakeTools.js";
import { blogPostValidation, blogPostCommentValidation } from "./validation.js";
import multer from "multer";

const blogPostsRouter = express.Router();

// get blog posts information
blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await readBlogPosts();
    console.log(blogPosts);

    if (req.query && req.query.title) {
      const filteredBlogPosts = blogPosts.filter((post) =>
        post.title
          .toLocaleLowerCase()
          .includes(req.query.title.toLocaleLowerCase())
      );
      res.send(filteredBlogPosts);
    } else {
      res.send(blogPosts);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// get blog post with matching ID
blogPostsRouter.get("/:id", async (req, res, next) => {
  try {
    const paramsID = req.params.id;
    const blogPosts = await readBlogPosts();
    const blogPost = blogPosts.find((blogPost) => blogPost.id === paramsID);
    if (blogPost) {
      res.send(blogPost);
    } else {
      res.send(
        createHttpError(404, `Blog post with id: ${paramsID} was not found.`)
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// create a new post
blogPostsRouter.post("/", blogPostValidation, async (req, res, next) => {
  try {
    const errorList = validationResult(req);
    if (errorList.isEmpty) {
      const authors = await readAuthors();
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];

      const blogPosts = await readBlogPosts();

      const newBlogPost = {
        id: uniqid(),
        createdAt: new Date(),
        // readTime: { value: 1, unit: "minute" },
        author: {
          name: `${randomAuthor.name} ${randomAuthor.surname}`,
          avatar: randomAuthor.avatar,
        },
        comments: [],
        ...req.body,
      };

      blogPosts.push(newBlogPost);
      await writeBlogPosts(blogPosts);

      res.status(201).send(newBlogPost);
    } else {
      next(createHttpError(400, { errorList }));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// update blog posts
blogPostsRouter.put("/:id", blogPostValidation, async (req, res, next) => {
  try {
    const errorList = validationResult(req);
    if (errorList.isEmpty()) {
      const paramsID = req.params.id;
      const blogPosts = await readBlogPosts();
      const blogPostToUpdate = blogPosts.find(
        (blogPost) => blogPosts.id === paramsID
      );

      const updatedBlogPost = { ...blogPostToUpdate, ...req.body };

      const remainingBlogPosts = blogPosts.filter((p) => p.id !== paramsID);

      remainingBlogPosts.push(updatedBlogPost);
      await writeBlogPosts(remainingBlogPosts);

      res.send(updatedBlogPost);
    } else {
      next(createHttpError(400, { errorList }));
    }
  } catch (error) {
    next(error);
  }
});

// delete blog post
blogPostsRouter.delete("/:id", async (req, res, next) => {
  try {
    const paramsID = req.params._id;
    const blogPosts = await readBlogPosts();
    const blogPost = blogPosts.find((blogPost) => blogPost.id === paramsID);
    if (blogPost) {
      const remainingBlogPosts = blogPosts.filter(
        (blogPost) => blogPost.id !== paramsID
      );

      await writeBlogPosts(remainingBlogPosts);

      res.send({
        message: `The Blog post with id: ${blogPost.id} was deleted`,
        blogPost: blogPost,
      });
    } else {
      next(
        createHttpError(404, `The blog post with id: ${paramsID} was not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// blog posts cover
blogPostsRouter.post(
  "/:id/upload/cover",
  multer({ storage: saveCoverCloudinary }).single("cover"),
  async (req, res, next) => {
    try {
      const paramsId = req.params.id;
      const blogPosts = await readBlogPosts();
      const blogPost = blogPosts.find((blogPost) => blogPost.id === paramsId);
      if (blogPost) {
        const coverUrl = req.file.path;
        const updatedBlogPost = { ...blogPost, cover: coverUrl };
        const remainingBlogPosts = blogPosts.filter(
          (blogPost) => blogPost.id !== paramsId
        );

        remainingBlogPosts.push(updatedBlogPost);
        await writeBlogPosts(remainingBlogPosts);
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(404, `Blog post with id: ${paramsId} was not found.`)
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// get comments of a blog post
blogPostsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const paramsId = req.params.id;
    const blogPosts = await readBlogPosts();
    const blogPost = blogPosts.find((blogPost) => blogPost.id === paramsId);
    if (blogPost) {
      const blogPostComments = blogPost.comments;
      res.send(blogPostComments);
    } else {
      next(
        createHttpError(404, `Blog post with id: ${paramsId} was not found.`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// download blog post as PDF
blogPostsRouter.get("/:id/download/pdf", async (req, res, next) => {
  try {
    const paramsID = req.params._id;
    const blogPosts = await readBlogPosts();
    const blogPost = blogPosts.find((blogPost) => blogPost.id === paramsID);
    if (blogPost) {
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=blog-post.pdf"
      ); // this enables to download the pdf
      const source = await getBlogPostPDFReadableStream(blogPost);
      const destination = res;

      pipeline(source, destination, (err) => {
        if (err) next(err);
      });
    } else {
      res.send(
        createHttpError(404, `Blog post with id: ${paramsID} was not found.`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// send PDF as email
blogPostsRouter.get("/:id/email", async (req, res, next) => {
  try {
    const paramsID = req.params.id;
    const blogPosts = await readBlogPosts();
    const blogPost = blogPosts.find((blogPost) => blogPost.id === paramsID);
    if (blogPost) {
      const blogPostPDFPath = await generateBlogPostPDFAsync(blogPost);
      await sendEmail(blogPost, blogPostPDFPath);
      await deletePDFFile(blogPostPDFPath);
      res.send("Email sent!");
    } else {
      res.send(
        createHttpError(404, `Blog post with id: ${paramsID} was not found.`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;
