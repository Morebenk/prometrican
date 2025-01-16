import { UserAttempt } from "../models/user_attempts.model.js";
import { UserAnswer } from "../models/user_answers.model.js";
import { WrongAnswer } from "../models/wrong_answers.model.js";
import { Question } from "../models/questions.model.js";
import { Category } from "../models/categories.model.js";
import { Subject } from "../models/subjects.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getPerformanceAnalytics = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const { timeframe = "all", subject_id } = req.query;

  let dateFilter = {};
  const currentDate = new Date();

  switch (timeframe) {
    case "week":
      dateFilter = {
        createdAt: {
          $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
        },
      };
      break;
    case "month":
      dateFilter = {
        createdAt: {
          $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        },
      };
      break;
    case "year":
      dateFilter = {
        createdAt: {
          $gte: new Date(
            currentDate.setFullYear(currentDate.getFullYear() - 1)
          ),
        },
      };
      break;
  }

  let subjectFilter = {};
  if (subject_id) {
    const categories = await Category.find({ subject_id });
    const categoryIds = categories.map((cat) => cat._id);
    const questions = await Question.find({
      category_id: { $in: categoryIds },
    });
    const questionIds = questions.map((q) => q._id);
    subjectFilter = { question_id: { $in: questionIds } };
  }

  const performanceStats = await UserAnswer.aggregate([
    {
      $match: {
        ...dateFilter,
        ...subjectFilter,
      },
    },
    {
      $lookup: {
        from: "choices",
        localField: "selected_choice_id",
        foreignField: "_id",
        as: "selectedChoice",
      },
    },
    { $unwind: "$selectedChoice" },
    {
      $group: {
        _id: null,
        totalAnswers: { $sum: 1 },
        correctAnswers: {
          $sum: { $cond: ["$selectedChoice.is_correct", 1, 0] },
        },
        averageScore: {
          $avg: { $cond: ["$selectedChoice.is_correct", 1, 0] },
        },
      },
    },
  ]);

  const categoryPerformance = await UserAnswer.aggregate([
    {
      $match: {
        ...dateFilter,
        ...subjectFilter,
      },
    },
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
      $lookup: {
        from: "choices",
        localField: "selected_choice_id",
        foreignField: "_id",
        as: "selectedChoice",
      },
    },
    { $unwind: "$selectedChoice" },
    {
      $group: {
        _id: "$category._id",
        categoryName: { $first: "$category.name" },
        totalQuestions: { $sum: 1 },
        correctAnswers: {
          $sum: { $cond: ["$selectedChoice.is_correct", 1, 0] },
        },
      },
    },
    {
      $project: {
        categoryName: 1,
        totalQuestions: 1,
        correctAnswers: 1,
        accuracy: {
          $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100],
        },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overall: performanceStats[0] || {
          totalAnswers: 0,
          correctAnswers: 0,
          averageScore: 0,
        },
        categoryPerformance,
      },
      "Performance analytics retrieved successfully"
    )
  );
});

const getProgressTracking = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const { subject_id } = req.query;

  // Get subject categories
  const categories = await Category.find({ subject_id });
  const categoryIds = categories.map((cat) => cat._id);

  // Get total questions per category
  const totalQuestions = await Question.aggregate([
    {
      $match: { category_id: { $in: categoryIds } },
    },
    {
      $group: {
        _id: "$category_id",
        total: { $sum: 1 },
      },
    },
  ]);

  // Get attempted questions per category
  const attemptedQuestions = await UserAnswer.aggregate([
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
      $match: {
        "question.category_id": { $in: categoryIds },
      },
    },
    {
      $group: {
        _id: "$question.category_id",
        attempted: { $addToSet: "$question._id" },
      },
    },
    {
      $project: {
        _id: 1,
        attempted: { $size: "$attempted" },
      },
    },
  ]);

  // Combine data
  const progress = categories.map((category) => {
    const total = totalQuestions.find(
      (t) => t._id.toString() === category._id.toString()
    );
    const attempted = attemptedQuestions.find(
      (a) => a._id.toString() === category._id.toString()
    );

    return {
      category_id: category._id,
      categoryName: category.name,
      totalQuestions: total?.total || 0,
      attemptedQuestions: attempted?.attempted || 0,
      progressPercentage: total?.total
        ? ((attempted?.attempted || 0) / total.total) * 100
        : 0,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        progress,
        "Progress tracking data retrieved successfully"
      )
    );
});

const getWeakAreas = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const { subject_id } = req.query;

  let subjectFilter = {};
  if (subject_id) {
    const categories = await Category.find({ subject_id });
    const categoryIds = categories.map((cat) => cat._id);
    subjectFilter = { category_id: { $in: categoryIds } };
  }

  const weakAreas = await WrongAnswer.aggregate([
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
      $match: {
        question: { $exists: true },
        ...subjectFilter,
      },
    },
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
        totalWrongAnswers: { $sum: 1 },
        questions: {
          $push: {
            question_id: "$question._id",
            text: "$question.text",
          },
        },
      },
    },
    {
      $project: {
        categoryName: 1,
        totalWrongAnswers: 1,
        mostMissedQuestions: { $slice: ["$questions", 5] },
      },
    },
    { $sort: { totalWrongAnswers: -1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        weakAreas,
        "Weak areas analysis retrieved successfully"
      )
    );
});

const getStudyPatterns = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const { timeframe = "week" } = req.query;

  let dateFilter = {};
  const currentDate = new Date();

  switch (timeframe) {
    case "week":
      dateFilter = {
        createdAt: {
          $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
        },
      };
      break;
    case "month":
      dateFilter = {
        createdAt: {
          $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        },
      };
      break;
  }

  const studyPatterns = await UserAttempt.aggregate([
    {
      $match: {
        user_id,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        totalTime: { $sum: "$time_spent" },
        attempts: { $sum: 1 },
        averageScore: { $avg: "$score" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Calculate peak study times
  const peakTimes = await UserAttempt.aggregate([
    {
      $match: {
        user_id,
        ...dateFilter,
      },
    },
    {
      $group: {
        _id: {
          $hour: "$createdAt",
        },
        count: { $sum: 1 },
        averageScore: { $avg: "$score" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        dailyPatterns: studyPatterns,
        peakStudyTimes: peakTimes,
      },
      "Study patterns retrieved successfully"
    )
  );
});

export {
  getPerformanceAnalytics,
  getProgressTracking,
  getWeakAreas,
  getStudyPatterns,
};
