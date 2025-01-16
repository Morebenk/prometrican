import { Router } from "express";
import {
  flagQuestion,
  getFlaggedQuestions,
  removeFlagFromQuestion,
} from "../controllers/flag.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(flagQuestion).get(getFlaggedQuestions);

router.route("/:flagId").delete(removeFlagFromQuestion);

export default router;
