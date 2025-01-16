import { FlaggedQuestion } from "../models/flagged.model.js";
import { Question } from "../models/questions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const flagQuestion = asyncHandler(async (req, res) => {
  const { question_id, reason } = req.body;
  const user_id = req.user._id;

  // Validate question exists
  const question = await Question.findById(question_id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Check if already flagged
  const existing = await FlaggedQuestion.findOne({ user_id, question_id });
  if (existing) {
    throw new ApiError(400, "Question already flagged by user");
  }

  // Create flag
  const flag = await FlaggedQuestion.create({
    user_id,
    question_id,
    reason,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, flag, "Question flagged successfully"));
});

const getFlaggedQuestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, reason } = req.query;
  const user_id = req.user._id;

  const query = { user_id };
  if (reason) {
    query.reason = reason;
  }

  const flags = await FlaggedQuestion.aggregate([
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
        from: "choices",
        localField: "question._id",
        foreignField: "question_id",
        as: "question.choices",
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  const total = await FlaggedQuestion.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        flags,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Flagged questions retrieved successfully"
    )
  );
});

const removeFlagFromQuestion = asyncHandler(async (req, res) => {
  const { flagId } = req.params;
  const user_id = req.user._id;

  const flag = await FlaggedQuestion.findOne({ _id: flagId, user_id });
  if (!flag) {
    throw new ApiError(404, "Flag not found or unauthorized");
  }

  await flag.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Flag removed successfully"));
});

export { flagQuestion, getFlaggedQuestions, removeFlagFromQuestion };
