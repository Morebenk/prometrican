import { Router } from "express";
import {
  createSubscription,
  getUserSubscriptions,
  renewSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createSubscription).get(getUserSubscriptions);

router.route("/renew").post(renewSubscription);

router.route("/:subscription_id/cancel").post(cancelSubscription);

export default router;
