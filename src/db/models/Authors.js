import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      description: "name is required",
    },

    surname: {
      type: String,
      required: true,
      description: "surname is required",
    },
    email: {
      type: String,
      required: true,
      description: "surname is required",
    },
    avatar: {
      type: String,
      required: false,
      description: "surname is required",
    },

    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Author", AuthorSchema);
