import { Router } from "express";
import {
  getWrongAnswers,
  getWrongAnswersByCategory,
  getMostFrequentlyMissed,
  getWrongAnswerTrends,
} from "../controllers/wrong-answer.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getWrongAnswers);
router.get("/by-category", getWrongAnswersByCategory);
router.get("/frequently-missed", getMostFrequentlyMissed);
router.get("/trends", getWrongAnswerTrends);

export default router;
