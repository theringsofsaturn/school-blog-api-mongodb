import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo"
import AuthorModel from "../models/Authors.js"

const mongoAuthorsRouter = express.Router();

// **************** CREATE NEW AUTHOR ****************

mongoAuthorsRouter.post('/', async (req, res, next) => {
    try {
        const newAuthor = new AuthorModel(req.body)
        const { _id } = await newAuthor.save()

        res.status(201).send({ _id })

    } catch (error) {
        console.log(error.name);
        if(error.name === "ValidationError") {
            next(createError(400, error))
        } else {
            console.log(error)
            next(createError(500, "An Error ocurred while creating a new author"))
        }
    }
})

// ********************* GET ALL AUTHORS *********************
mongoAuthorsRouter.get('/', async (req, res, next) => {
    try {
        const authors = await AuthorModel.find()
        res.send(authors)
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the list of authors"))
    }
})

export default mongoAuthorsRouter;