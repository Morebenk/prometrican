import { Router } from "express";
import {
  getPerformanceAnalytics,
  getProgressTracking,
  getWeakAreas,
  getStudyPatterns,
} from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.get("/performance", getPerformanceAnalytics);
router.get("/progress", getProgressTracking);
router.get("/weak-areas", getWeakAreas);
router.get("/study-patterns", getStudyPatterns);

export default router;
