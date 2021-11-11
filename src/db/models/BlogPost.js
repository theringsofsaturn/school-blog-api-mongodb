import mongoose from "mongoose";
const { Schema, model } = mongoose;

const BlogPost = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
    },
    readTime: {
      value: {
        type: Number,
      },
      unit: {
        type: String,
      },
    },
    author: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Author",
      },
    ],
    // {  ======= OLD CONFIGURATION OF AUTHOR ======
    //     name: {
    //         type: String,
    //         required: true,
    //     },
    //     avatar: {
    //         type: String,
    //     },
    // },
    content: {
      type: String,
      required: true,
    },
    comments: [
      {
        comment: String,
        rate: {
          type: Number,
          min: 1,
          max: 5,
          default: 1,
        },
        author: [
          {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Author",
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

//************** STATIC FUNCTION FOR POSTS **************
BlogPost.static("findPosts", async function (query) {
  const total = await this.countDocuments(query.criteria);
  const posts = await this.find(query.criteria, query.options.fields)
    .skip(query.options.skip)
    .limit(query.options.limit)
    .sort(query.options.sort)
    .populate("author", { _id: 0, name: 1, avatar: 1 });

  return { total, posts };
});

BlogPost.static("findPost", async function (postId) {
  const post = await this.findById(postId).populate("author", {
    _id: 0,
    name: 1,
    avatar: 1,
  });
  return post;
});


//************** STATIC FUNCTION FOR COMMENTS **************
BlogPost.static('findPostComments', async function (postId) {
  const postComments = await this.findById(postId)
      .populate({ 
          path: 'comments', 
          populate: { 
              path: "author", 
              select: {_id: 0, name: 1, avatar: 1}
          }
      })

  return postComments
})

BlogPost.static('findPostComment', async function (postId, commentId) {
  const postComment = await this.findById(postId, { comments: { $elemMatch: { _id: commentId}}})
      .populate({ 
          path: 'comments', 
          populate: { 
              path: "author", 
              select: {_id: 0, name: 1, avatar: 1}
          }
      })

  return postComment
})


// ******************** STATIC FUNTION FOR AUTHORS ******************** 
blogSchema.static("findAuthors", async function (query) {
  const total = await this.countDocuments(query.criteria)
  const blogs = await this.find(query.criteria, query.options.fields)
  .skip(query.options.skip)
  .limit(query.options.limit)
  .sort(query.options.sort)
  .populate("authors")

  return { total, blogs }

})

blogSchema.static("findAuthor", async function (id) {
      const blog = await this.findById(id).populate("authors")
      return blog
})


export default mongoose.model("BlogPost", BlogPost);
