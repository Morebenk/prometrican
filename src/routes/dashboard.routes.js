import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.get("/stats", getDashboardStats);

export default router;
