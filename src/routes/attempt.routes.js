import { Router } from "express";
import {
  startQuizAttempt,
  submitAnswer,
  completeAttempt,
  getAttemptHistory,
} from "../controllers/attempt.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(startQuizAttempt).get(getAttemptHistory);

router.route("/answer").post(submitAnswer);

router.route("/:attempt_id/complete").post(completeAttempt);

export default router;
