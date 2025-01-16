import { Router } from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserNotifications).delete(clearAllNotifications);

router
  .route("/:notificationId")
  .patch(markNotificationAsRead)
  .delete(deleteNotification);

export default router;
