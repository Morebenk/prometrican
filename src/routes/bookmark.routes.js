import { Router } from "express";
import {
  toggleBookmark,
  getBookmarkedQuestions,
} from "../controllers/bookmark.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(toggleBookmark).get(getBookmarkedQuestions);

export default router;
