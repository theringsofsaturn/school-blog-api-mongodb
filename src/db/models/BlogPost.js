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

export default mongoose.model("Blogs", BlogPost);
