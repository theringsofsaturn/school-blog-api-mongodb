import mongoose from "mongoose";
const { Schema, model } = mongoose;

const BlogPost = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      description: "should be a string",
    },
    title: {
      type: String,
      required: true,
      description: "should be a string",
    },
    cover: {
      type: String,
      description: "should be a url",
    },
    readTime: {
      type: Object,
      properties: {
        value: {
          type: Number,
         
          description: "should be a number",
        },
        unit: {
          type: String,
         
          description: "should be a string",
        },
      },
    },

    author: {
      name: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
    },
    content: {
      type: String,
      required: true,
      description: "should be a string",
    },
    comments: [
      {
        name: String,
        comment: String,
        createdAt: Date,
        updatedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

BlogPost.static('findPostsWithAuthors', async function (query) {
  const total = await this.countDocuments(query.criteria)
  const posts = await this.find(query.criteria, query.options.fields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)
      .populate("author", { _id: 0, name: 1, avatar: 1})

  return { total, posts }
})

BlogPost.static('findPostWithAuthors' , async function (postId) {
  const post = await this.findById(postId)
      .populate('author', { _id: 0, name: 1, avatar: 1})
  return post
})

export default mongoose.model("Blogs", BlogPost);
