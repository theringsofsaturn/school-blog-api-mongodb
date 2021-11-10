import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo"
import AuthorModel from "../models/Authors.js"

const mongoAuthorsPostsRouter = express.Router();

export default mongoAuthorsPostsRouter;