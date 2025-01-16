import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { UserAttempt } from "../models/user_attempts.model.js";
import { WrongAnswer } from "../models/wrong_answers.model.js";
import { BookmarkedQuestion } from "../models/bookmarks.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validationResult } from "express-validator";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, "Error while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details retrieved successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const { username, email } = req.body;
  const userId = req.user._id;

  // Check for existing users with the same username or email
  const existingUser = await User.findOne({
    $or: [
      { username, _id: { $ne: userId } },
      { email, _id: { $ne: userId } },
    ],
  });

  if (existingUser) {
    throw new ApiError(409, "Username or email already taken");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        username: username?.toLowerCase(),
        email: email?.toLowerCase(),
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get quiz attempts statistics
  const attemptStats = await UserAttempt.aggregate([
    { $match: { user_id: userId } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: "$score" },
        totalTimeSpent: { $sum: "$time_spent" },
        completedQuizzes: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
  ]);

  // Get wrong answers count
  const wrongAnswersCount = await WrongAnswer.countDocuments({
    user_id: userId,
  });

  // Get bookmarked questions count
  const bookmarkedCount = await BookmarkedQuestion.countDocuments({
    user_id: userId,
  });

  // Get recent activity
  const recentAttempts = await UserAttempt.aggregate([
    { $match: { user_id: userId } },
    {
      $lookup: {
        from: "quizzes",
        localField: "quiz_id",
        foreignField: "_id",
        as: "quiz",
      },
    },
    { $unwind: "$quiz" },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
  ]);

  const stats = {
    attempts: attemptStats[0] || {
      totalAttempts: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      completedQuizzes: 0,
    },
    wrongAnswersCount,
    bookmarkedCount,
    recentActivity: recentAttempts,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, stats, "User statistics retrieved successfully")
    );
});

const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Delete all user-related data
  await Promise.all([
    UserAttempt.deleteMany({ user_id: userId }),
    WrongAnswer.deleteMany({ user_id: userId }),
    BookmarkedQuestion.deleteMany({ user_id: userId }),
    User.findByIdAndDelete(userId),
  ]);

  const options = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateProfile,
  getUserStats,
  deleteAccount,
};
