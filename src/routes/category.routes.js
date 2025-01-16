import { Router } from "express";
import {
  createCategory,
  getCategoriesBySubject,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Protect all routes

router.route("/").post(createCategory);

router.route("/subject/:subjectId").get(getCategoriesBySubject);

router.route("/:categoryId").put(updateCategory).delete(deleteCategory);

export default router;
