import mongoose from "mongoose";

const BlogsSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String },
    readTime: {
      type: Object,
      properties: {
        value: {
          type: Number,
        },
        unit: {
          type: String,
        },
      },
    },
    author: { type: String, },
    avatar: { type: String },

    // comments: [
    //     {
    //         comment: String,
    //         rate: {
    //             type: Number,
    //             min: 1,
    //             max: 5,
    //             default: 1,
    //         },
    //         author: [{
    //             type: Schema.Types.ObjectId,
    //             required: true,
    //             ref: "Author"
    //         }],
    //     }
    // ]
  },
  { timestamps: true }
);

export default mongoose.model("Blogs", BlogsSchema);
