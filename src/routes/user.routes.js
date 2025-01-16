import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateProfile,
  getUserStats,
  deleteAccount,
} from "../controllers/user.controller.js";
import {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
} from "../middlewares/validation.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.use(verifyJWT);

router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);
router.get("/stats", getUserStats);

router.put("/change-password", validatePasswordChange, changePassword);
router.put("/update-profile", validateProfileUpdate, updateProfile);

router.delete("/delete-account", deleteAccount);

export default router;
