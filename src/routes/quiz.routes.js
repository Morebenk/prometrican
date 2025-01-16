import { Router } from "express";
import {
  createQuiz,
  getQuizById,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quiz.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Protect all routes

router.route("/").post(createQuiz).get(getAllQuizzes);

router.route("/:quizId").get(getQuizById).put(updateQuiz).delete(deleteQuiz);

export default router;
