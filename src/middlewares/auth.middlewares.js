import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isDevelopment = process.env.NODE_ENV === "development";

// JWT Verification Middleware
export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies.accessToken;

  if (!token) {
    throw new ApiError(
      401,
      isDevelopment
        ? "Access token is missing. Please provide a valid token."
        : "Unauthorized!"
    );
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(
        401,
        isDevelopment
          ? "User linked to this token no longer exists."
          : "Unauthorized!"
      );
    }

    // Attach user data to the request object
    req.user = user;
    next();
  } catch (error) {
    const isTokenExpired = error.name === "TokenExpiredError";
    const message = isTokenExpired
      ? isDevelopment
        ? "Token expired. Please re-authenticate."
        : "Token expired."
      : isDevelopment
        ? `Token verification failed: ${error.message}`
        : "Invalid access token!";

    throw new ApiError(401, message);
  }
});
