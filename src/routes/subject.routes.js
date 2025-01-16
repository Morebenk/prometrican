import { Router } from "express";
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Protect all routes

router.route("/").post(createSubject).get(getAllSubjects);

router
  .route("/:subjectId")
  .get(getSubjectById)
  .put(updateSubject)
  .delete(deleteSubject);

export default router;
