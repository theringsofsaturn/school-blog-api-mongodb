import mongoose from "mongoose";

const AuthorModel = new mongoose.Schema({
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
    description: "email is required",
  },
  avatar: {
    type: String,
    required: true,
    description: "avatar is required",
  },
});

export default mongoose.model("Author", AuthorModel);
