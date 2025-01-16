import { Router } from "express";
import {
  createQuestion,
  getQuestionsByCategory,
  updateQuestion,
  deleteQuestion,
} from "../controllers/question.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Protect all routes

router.route("/").post(createQuestion);

router.route("/category/:categoryId").get(getQuestionsByCategory);

router.route("/:questionId").put(updateQuestion).delete(deleteQuestion);

export default router;
