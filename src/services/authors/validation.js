// Validation for authors
import { body } from "express-validator";

export const authorsValidation = [
  body("name").exists().withMessage("Name is a mandatory field!"),
  body("surname").exists().withMessage("Surname is a mandatory field!"),
  body("email").isEmail().withMessage("Must be a valid email!"),
  body("birthDate").exists().withMessage("Birth Date is a mandatory field!"),
];
