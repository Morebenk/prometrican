import { UserAttempt } from "../models/user_attempts.model.js";
import { WrongAnswer } from "../models/wrong_answers.model.js";
import { BookmarkedQuestion } from "../models/bookmarks.model.js";
import { Subscription } from "../models/subscriptions.model.js";
import { Notification } from "../models/notifications.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const currentDate = new Date();

  // Get recent activity
  const recentActivity = await UserAttempt.aggregate([
    { $match: { user_id } },
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

  // Get active subscriptions
  const activeSubscriptions = await Subscription.aggregate([
    {
      $match: {
        user_id,
        end_date: { $gt: currentDate },
      },
    },
    {
      $lookup: {
        from: "subjects",
        localField: "subject_id",
        foreignField: "_id",
        as: "subject",
      },
    },
    { $unwind: "$subject" },
  ]);

  // Get performance summary
  const performanceSummary = await UserAttempt.aggregate([
    { $match: { user_id } },
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

  // Get unread notifications count
  const unreadNotifications = await Notification.countDocuments({
    user_id,
    read: false,
  });

  // Get weak areas summary
  const weakAreas = await WrongAnswer.aggregate([
    { $match: { user_id } },
    {
      $lookup: {
        from: "questions",
        localField: "question_id",
        foreignField: "_id",
        as: "question",
      },
    },
    { $unwind: "$question" },
    {
      $lookup: {
        from: "categories",
        localField: "question.category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  // Get bookmarked questions count
  const bookmarkedCount = await BookmarkedQuestion.countDocuments({ user_id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        recentActivity,
        activeSubscriptions,
        performanceSummary: performanceSummary[0] || {
          totalAttempts: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          completedQuizzes: 0,
        },
        unreadNotifications,
        weakAreas,
        bookmarkedCount,
      },
      "Dashboard statistics retrieved successfully"
    )
  );
});

export { getDashboardStats };
