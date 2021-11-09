import fs from "fs-extra"; // will enable to read or write the json file at the particular path
import { fileURLToPath } from "url"; // it's core module (no need to install) to convert the current url from import.meta.url to current file path
import { join, dirname } from "path"; // core modules(no need to install). dirname will localize the directory name, join will join directory with json file name

import { v2 as cloudinary } from "cloudinary"; // cloudinary module
import { CloudinaryStorage } from "multer-storage-cloudinary"; // cloudinary module

//  fs variables to read & write
const {
  readJSON,
  writeJSON,
  writeFile,
  readFile,
  remove,
  createReadStream,
  createWriteStream,
} = fs;

// obtaining the path to the authors json file
//1. 1. I'll start from the current file I'm in right now (C://......./authors/index.js) and I'll get the path to that file
// import.meta.url give us info about the url of the current module
// fileURLToPath converts that url into a path
// const currentFilePath = fileURLToPath(import.meta.url);
//2. Next we obtain the path of the directory the current file is in (I'll get the parent folder's path)
// dirname extracts the directory name from the specified path
// const currentDirPath = dirname(currentFilePath);
// that is the same as const currentDir = dirname(fileURLToPath(import.meta.url))
//3. Next step is to concatenate the directory path with the json file name which is authors.json
//ATTENTION USE THE METHOD JOIN (from path) AND NOT CONCATENATE AS USUAL WITH +, this way will function for every system
// const authorsJSONPath = join(currentDirPath, "authors.json");


// Folders URL path
const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data/blogs.json"
);

export const blogPostsFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/img/blogs"
);

const authorsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data/authors.json"
);

export const authorsAvatarsFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../public/img/authors"
);

// const publicFolderPath = join(process.cwd(), "./public/img/"); //process.cwd() is ROOT

// *************** AUTHORS ****************
// Functions stored into a variable to read & write
export const readAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (content) => writeJSON(authorsJSONPath, content);
export const getAuthorsReadableStream = () => createReadStream(authorsJSONPath);

// Avatars

// cloudinary method
export const saveAvatarCloudinary = new CloudinaryStorage({
  cloudinary,
  params: {
    format: "jpg",
    folder: "striveBlog/avatars",
  },
});

// fs-methods

// Save avatar
export const saveAvatar = (fileName, content) =>
  writeFile(join(authorsAvatarsFolderPath, fileName), content); // content is buffer

// Remove avatar
export const removeAvatar = (fileName) =>
  remove(join(authorsAvatarsFolderPath, fileName));

// ************* BLOG POSTS *****************
export const readBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (content) => writeJSON(blogPostsJSONPath, content); // content is array

// Covers

// cloudinary method
export const saveCoverCloudinary = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "striveBlog/covers",
  },
});

// fs method
export const saveCover = (fileName, content) =>
  writeFile(join(blogPostsFolderPath, fileName), content);
export const removeCover = (fileName) =>
  remove(join(blogPostsFolderPath, fileName));

  // email
export const writePDFStream = (path) => createWriteStream(path);
export const readPDFFile = (path) => readFile(path);
export const deletePDFFile = (path) => remove(path);
