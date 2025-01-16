import { BookmarkedQuestion } from "../models/bookmarks.model.js";
import { Question } from "../models/questions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleBookmark = asyncHandler(async (req, res) => {
  const { question_id, status = "bookmarked" } = req.body;
  const user_id = req.user._id;

  // Validate question exists
  const question = await Question.findById(question_id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Check if already bookmarked
  const existing = await BookmarkedQuestion.findOne({ user_id, question_id });

  if (existing) {
    // Remove bookmark if exists
    await existing.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Bookmark removed successfully"));
  }

  // Create new bookmark
  const bookmark = await BookmarkedQuestion.create({
    user_id,
    question_id,
    status,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, bookmark, "Question bookmarked successfully"));
});

const getBookmarkedQuestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const user_id = req.user._id;

  const query = { user_id };
  if (status) {
    query.status = status;
  }

  const bookmarks = await BookmarkedQuestion.aggregate([
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

  const total = await BookmarkedQuestion.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookmarks,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Bookmarked questions retrieved successfully"
    )
  );
});

export { toggleBookmark, getBookmarkedQuestions };
