import mongoose from "mongoose";

const AuthorModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: `https://ui-avatars.com/api/?name=Emilian+Kasemi`,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Author", AuthorModel);
