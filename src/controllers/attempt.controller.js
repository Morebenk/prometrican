import { UserAttempt } from "../models/user_attempts.model.js";
import { UserAnswer } from "../models/user_answers.model.js";
import { Quiz } from "../models/quizzes.model.js";
import { Choice } from "../models/choices.model.js";
import { WrongAnswer } from "../models/wrong_answers.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const startQuizAttempt = asyncHandler(async (req, res) => {
  const { quiz_id } = req.body;
  const user_id = req.user._id;

  // Check if quiz exists
  const quiz = await Quiz.findById(quiz_id);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  // Check for existing incomplete attempt
  const existingAttempt = await UserAttempt.findOne({
    user_id,
    quiz_id,
    status: { $in: ["not_started", "in_progress"] },
  });

  if (existingAttempt) {
    return res
      .status(200)
      .json(new ApiResponse(200, existingAttempt, "Existing attempt found"));
  }

  // Create new attempt
  const attempt = await UserAttempt.create({
    user_id,
    quiz_id,
    status: "in_progress",
    last_question_position: 1,
    score: 0,
    time_spent: 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attempt, "Quiz attempt started successfully"));
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { attempt_id, question_id, selected_choice_id, time_spent } = req.body;

  // Validate attempt
  const attempt = await UserAttempt.findById(attempt_id);
  if (!attempt || attempt.user_id.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Attempt not found or unauthorized");
  }

  if (attempt.status === "completed") {
    throw new ApiError(400, "Cannot submit answer for completed attempt");
  }

  // Validate selected choice
  const choice = await Choice.findById(selected_choice_id);
  if (!choice || choice.question_id.toString() !== question_id) {
    throw new ApiError(400, "Invalid choice selected");
  }

  // Record answer
  const answer = await UserAnswer.create({
    attempt_id,
    question_id,
    selected_choice_id,
  });

  // If answer is wrong, record it in wrong_answers
  if (!choice.is_correct) {
    await WrongAnswer.findOneAndUpdate(
      { user_id: req.user._id, question_id },
      { $set: { user_id: req.user._id, question_id } },
      { upsert: true, new: true }
    );
  }

  // Update attempt
  attempt.time_spent = (attempt.time_spent || 0) + (time_spent || 0);
  attempt.last_question_position += 1;
  await attempt.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { answer, attempt }, "Answer submitted successfully")
    );
});

const completeAttempt = asyncHandler(async (req, res) => {
  const { attempt_id } = req.params;

  const attempt = await UserAttempt.findById(attempt_id);
  if (!attempt || attempt.user_id.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Attempt not found or unauthorized");
  }

  if (attempt.status === "completed") {
    throw new ApiError(400, "Attempt already completed");
  }

  // Calculate score
  const answers = await UserAnswer.find({ attempt_id });
  const totalQuestions = answers.length;
  let correctAnswers = 0;

  for (const answer of answers) {
    const choice = await Choice.findById(answer.selected_choice_id);
    if (choice.is_correct) {
      correctAnswers++;
    }
  }

  const score = (correctAnswers / totalQuestions) * 100;

  // Update attempt
  attempt.status = "completed";
  attempt.score = score;
  await attempt.save();

  return res
    .status(200)
    .json(new ApiResponse(200, attempt, "Quiz attempt completed successfully"));
});

const getAttemptHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const user_id = req.user._id;

  const attempts = await UserAttempt.aggregate([
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
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  const total = await UserAttempt.countDocuments({ user_id });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attempts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Attempt history retrieved successfully"
    )
  );
});

export { startQuizAttempt, submitAnswer, completeAttempt, getAttemptHistory };
