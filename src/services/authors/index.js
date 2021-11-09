import express from "express"; // We need to import express to use it's functionalities
import uniqid from "uniqid"; // will generate a unique ID for the authors
import createHttpError from "http-errors"; // Handle all status code errors messages with this package
import multer from "multer";
import { validationResult } from "express-validator";
import { authorsValidation } from "./validation.js";
import { pipeline } from "stream";
import json2csv from "json2csv";

import {
  readAuthors,
  writeAuthors,
  saveAvatarCloudinary,
  getAuthorsReadableStream,
} from "../../lib/fs-tools.js";

// READ --> GET http:localhost:3001/authors + (Optional Query Parameters) => returns the list of authors
// READ --> GET /authors/123 => returns a single author
// CREATE --> POST /authors (+body) => create a new author
// UPDATE --> PUT /authors/123 (+ body) => edit the author with the given id
// DELETE --> DELETE /authors/123 => delete the author with the given id

// Router is a set of endpoints that share something like a prefix. authorsRouter is going to have "/authors" a a prefix.
//  Here we use Router express functionality to provide Routing to the server
const authorsRouter = express.Router();

// Create a new author
authorsRouter.post("/", authorsValidation, async (req, res, next) => {
  try {
    const errorList = validationResult(req);
    if (errorList.isEmpty()) {
      // read the the content of authors.json
      const authors = await readAuthors();
      // read the requests body
      const newAuthor = {
        ...req.body,
        id: uniqid(),
        createdAt: new Date(),
      };
      // push new author to the array
      authors.push(newAuthor);
      // Rewrite the new array to the json file
      await writeAuthors(authors); 
      // send back the the ID as response
      res.status(201).send(newAuthor);
    } else {
      next(createError(400, { errorList }));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// Get all the authors
authorsRouter.get("/", async (req, res, next) => {
  try {
    // read the the content of authors.json and obtain the authors array.
    // It converts from machine language (buffer) to JSON
    const authors = await readAuthors(); // --> JSON.parse(fs.readFileSync(authorsJsonPath).toString);
    // readFileSync expects to receive a path on disk to read from and returns a Buffer, a sequence of Bytes which can be converted into a human readable string with the toString() method

    //2. send back the array of authors
    res.status(200).send(authors);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// Get an author with an ID
authorsRouter.get("/:id", async (req, res, next) => {
  try {
    // save request params id in a variable
    const paramsId = req.params.id;
    // read the the content of authors.json
    const authors = await readAuthors();

    // find the author with the id requested
    const author = authors.find((author) => author.id === paramsId);
    // if we get the author with that id (if it's true), then send back that author
    if (author) {
      res.status(200).send(author);
    } else {
      next(createError(404, `Author with id ${paramsId} was not found`));
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// Edit a specific author (the one that matches the id of the request)
authorsRouter.put("/:id", authorsValidation, async (req, res, next) => {
  try {
    // save request params id in a variable
    const paramsId = req.params.id;

    const errorList = validationResult(req);

    if (errorList.isEmpty()) {
      // read the content of authors.json
      const authors = await readAuthors();
      // find the author with the id requested
      const author = authors.find((author) => author.id === paramsId);
      // the updatedAuthor is the merge of the copied object of the current author that matches the id, with the copied object of the body request that will overwrite some part or everything of the original
      const updatedAuthor = { ...author, ...req.body };
      // the remaining authors - all the authors apart the one we want to modify, the one that matches the id
      const remainingAuthors = authors.filter(
        (author) => author.id !== paramsId
      );
      // push the updatedAuthor, the one we modified, to the remainingAuthors array (the authors we didn't touch)
      remainingAuthors.push(updatedAuthor);
      // with the function writeAuthord we can save the new updated array of authors in the authors json file where they are stored
      await writeAuthors(remainingAuthors);

      res.send({
        status: 200,
        message: `The author with the id: ${paramsId} was updated successfully`,
        author: author,
      });
    } else {
      next(
        createHttpError(
          404,
          `The author with the id: ${paramsId} was not found`
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// delete a specific author (the one that matches the id of the request)
authorsRouter.delete("/:id", async (req, res, next) => {
  try {
    // save request params id in a variable
    const paramsId = req.params.id;
    // read the the content of authors.json
    const authors = await readAuthors();
    // find the author with the id requested
    const author = authors.find((author) => author.id === paramsId);

    if (author) {
      // the remaining authors - all the authors apart the one we want to delete, the one that matches the id
      const remainingAuthors = authors.filter(
        (author) => author.id !== paramsId
      );
      // with the function writeAuthord we can save the new updated array of authors in the authors json file where they are stored
      await writeAuthors(remainingAuthors);

      res.send({
        status: 204,
        message: `The author with the id: ${paramsId} was deleted successfully`,
        author: author,
      });
    } else {
      next(
        createHttpError(
          404,
          `The author with the id: ${paramsId} was not found`
        )
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// search an author

authorsRouter.get("/", async (req, res, next) => {
  try {
    // read the the content of authors.json
    const authors = await readAuthors();

    // if there is a query name in the request, filter the name in authors json and see if it matches the one requested. If yes, send it back, if not send back the authors in the json
    if (req.query && req.query.name) {
      const filteredAuthors = authors.filter((author) =>
        author.name.toLowerCase().includes(req.query.name.toLowerCase())
      );
      res.send(filteredAuthors);
    } else {
      res.send(authors);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// upload an avatar
authorsRouter.post(
  "/:id/upload/avatar",
  multer({ storage: saveAvatarCloudinary }).single("avatar"),
  async (req, res, next) => {
    try {
      // save request params id in a variable
      const paramsId = req.params.id;
      // read the the content of authors.json
      const authors = await readAuthors();
      // find the author with the id requested
      const author = authors.find((author) => author.id === paramsId);

      if (author) {
        const avatarUrl = req.file.path;
        const updatedAuthor = { ...author, avatar: avatarUrl };
        const remainingAuthors = authors.filter(
          (author) => author.id !== paramsId
        );
        remainingAuthors.push(updatedAuthor);
        await writeAuthors(remainingAuthors);

        res.send(updatedAuthor);
      } else {
        next(
          createHttpError(404, `Author with the id: ${paramsId} was not found.`)
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// export CSV file
authorsRouter.get("/download/csv", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", `attachment; filename=Authors.csv`);

    const source = getAuthorsReadableStream();
    const transform = new json2csv.Transform({
      fields: ["_id", "name", "surname", "email", "birthDate", "avatar"],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) next(err);
    });
  } catch (error) {}
});

export default authorsRouter;
