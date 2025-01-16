import { WrongAnswer } from "../models/wrong_answers.model.js";
import { Question } from "../models/questions.model.js";
import { Choice } from "../models/choices.model.js";
import { Category } from "../models/categories.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getWrongAnswers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category_id, sort = "recent" } = req.query;
  const user_id = req.user._id;

  let query = { user_id };
  if (category_id) {
    const questions = await Question.find({ category_id });
    query.question_id = { $in: questions.map((q) => q._id) };
  }

  const sortOptions = {
    recent: { updatedAt: -1 },
    frequent: { count: -1 },
  };

  const wrongAnswers = await WrongAnswer.aggregate([
    { $match: query },
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
        localField: "question_id",
        foreignField: "question_id",
        as: "choices",
      },
    },
    {
      $addFields: {
        correctAnswer: {
          $filter: {
            input: "$choices",
            as: "choice",
            cond: { $eq: ["$$choice.is_correct", true] },
          },
        },
      },
    },
    {
      $group: {
        _id: "$question_id",
        question: { $first: "$question" },
        category: { $first: "$category" },
        choices: { $first: "$choices" },
        correctAnswer: { $first: "$correctAnswer" },
        count: { $sum: 1 },
        lastIncorrect: { $max: "$updatedAt" },
      },
    },
    { $sort: sort === "recent" ? { lastIncorrect: -1 } : { count: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  const total = await WrongAnswer.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$question_id",
      },
    },
    {
      $count: "total",
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        wrongAnswers,
        pagination: {
          total: total[0]?.total || 0,
          page: parseInt(page),
          pages: Math.ceil((total[0]?.total || 0) / limit),
        },
      },
      "Wrong answers retrieved successfully"
    )
  );
});

const getWrongAnswersByCategory = asyncHandler(async (req, res) => {
  const user_id = req.user._id;

  const categoryStats = await WrongAnswer.aggregate([
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
        totalWrongAnswers: { $sum: 1 },
        uniqueQuestions: { $addToSet: "$question_id" },
      },
    },
    {
      $project: {
        categoryName: 1,
        totalWrongAnswers: 1,
        uniqueQuestionsCount: { $size: "$uniqueQuestions" },
      },
    },
    { $sort: { totalWrongAnswers: -1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categoryStats,
        "Category-wise wrong answers statistics retrieved successfully"
      )
    );
});

const getMostFrequentlyMissed = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const user_id = req.user._id;

  const frequentlyMissed = await WrongAnswer.aggregate([
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
      $lookup: {
        from: "choices",
        localField: "question_id",
        foreignField: "question_id",
        as: "choices",
      },
    },
    {
      $group: {
        _id: "$question_id",
        question: { $first: "$question" },
        category: { $first: "$category" },
        choices: { $first: "$choices" },
        missCount: { $sum: 1 },
        lastMissed: { $max: "$updatedAt" },
      },
    },
    { $sort: { missCount: -1 } },
    { $limit: parseInt(limit) },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        frequentlyMissed,
        "Frequently missed questions retrieved successfully"
      )
    );
});

const getWrongAnswerTrends = asyncHandler(async (req, res) => {
  const { timeframe = "week" } = req.query;
  const user_id = req.user._id;

  let dateFilter = {};
  const currentDate = new Date();

  switch (timeframe) {
    case "week":
      dateFilter = {
        updatedAt: {
          $gte: new Date(currentDate.setDate(currentDate.getDate() - 7)),
        },
      };
      break;
    case "month":
      dateFilter = {
        updatedAt: {
          $gte: new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
        },
      };
      break;
  }

  const trends = await WrongAnswer.aggregate([
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
            date: "$updatedAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, trends, "Wrong answer trends retrieved successfully")
    );
});

export {
  getWrongAnswers,
  getWrongAnswersByCategory,
  getMostFrequentlyMissed,
  getWrongAnswerTrends,
};
