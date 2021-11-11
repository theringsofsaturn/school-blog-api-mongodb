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

// **************** GET AUTHOR BY ID ****************
mongoAuthorsRouter.get('/:authorId', async (req, res, next) => {
    try {
        const authorId = req.params.authorId
        const author = await AuthorModel.findById(authorId)

        if(author) {
            res.send(author)
        } else {
            next(createError(404, `author with _id ${authorId} was not Found!`))
        }
    } catch (error) {
        next(createError(500, "An Error ocurred while getting the author"))
    }
})

// ****************** DELETE AN AUTHOR ****************
mongoAuthorsRouter.delete('/:authorId', async (req, res, next) => {
    try {
        const authorId = req.params.authorId
        const deletedAuthor = await AuthorModel.findByIdAndDelete(authorId)

        if (deletedAuthor) {
            res.status(204).send()
        } else {
            next(createError(404, `Author with _id ${authorId} was not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while deleting the author ${req.params.authorId}`))
    }
})

// ********************** UPDATE AN AUTHOR **********************
mongoAuthorsRouter.put('/:authorId', async (req, res, next) => {
    try {
        const authorId = req.params.authorId
        const modifiedAuthor = await AuthorModel.findByIdAndUpdate(authorId, req.body, {
            new: true,
            runValidators: true,
        } )

        if(modifiedAuthor) {
            res.send(modifiedAuthor)
        } else {
            next(createError(404, `Author with _id ${authorId} was not Found!`))
        }
    } catch (error) {
        next(createError(500, `An Error ocurred while updating the author ${req.params.authorId}`))
    }
})

export default mongoAuthorsRouter;