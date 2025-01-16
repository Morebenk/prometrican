import { Quiz } from "../models/quizzes.model.js";
import { QuizQuestion } from "../models/quiz_questions.model.js";
import { Question } from "../models/questions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getQuizById = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new ApiError(400, "Invalid quiz ID");
  }

  const quiz = await Quiz.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(quizId),
      },
    },
    {
      $lookup: {
        from: "quiz_questions",
        localField: "_id",
        foreignField: "quiz_id",
        as: "quiz_questions",
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "quiz_questions.question_id",
        foreignField: "_id",
        as: "questions",
      },
    },
    {
      $lookup: {
        from: "choices",
        localField: "questions._id",
        foreignField: "question_id",
        as: "choices",
      },
    },
    {
      $project: {
        name: 1,
        createdAt: 1,
        questions: {
          $map: {
            input: "$questions",
            as: "question",
            in: {
              _id: "$$question._id",
              text: "$$question.text",
              image_urls: "$$question.image_urls",
              choices: {
                $filter: {
                  input: "$choices",
                  as: "choice",
                  cond: { $eq: ["$$choice.question_id", "$$question._id"] },
                },
              },
              position: {
                $arrayElemAt: [
                  "$quiz_questions.position",
                  { $indexOfArray: ["$questions._id", "$$question._id"] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        questions: {
          $sortArray: {
            input: "$questions",
            sortBy: { position: 1 },
          },
        },
      },
    },
  ]).exec();

  if (!quiz || quiz.length === 0) {
    throw new ApiError(404, "Quiz not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, quiz[0], "Quiz retrieved successfully"));
});

const getAllQuizzes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const quizzes = await Quiz.aggregate([
    {
      $lookup: {
        from: "quiz_questions",
        localField: "_id",
        foreignField: "quiz_id",
        as: "quiz_questions",
      },
    },
    {
      $lookup: {
        from: "questions",
        localField: "quiz_questions.question_id",
        foreignField: "_id",
        as: "questions",
      },
    },
    {
      $addFields: {
        questionCount: { $size: "$questions" },
      },
    },
    {
      $project: {
        name: 1,
        createdAt: 1,
        updatedAt: 1,
        questionCount: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ]);

  const total = await Quiz.countDocuments();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        quizzes,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Quizzes retrieved successfully"
    )
  );
});

const createQuiz = asyncHandler(async (req, res) => {
  const { name, questions } = req.body;

  if (
    !name ||
    !questions ||
    !Array.isArray(questions) ||
    questions.length === 0
  ) {
    throw new ApiError(400, "Name and questions array are required");
  }

  const quiz = await Quiz.create({ name });

  await QuizQuestion.insertMany(
    questions.map((questionId, index) => ({
      quiz_id: quiz._id,
      question_id: questionId,
      position: index + 1,
    }))
  );

  const createdQuiz = await getQuizById(quiz._id);

  return res
    .status(201)
    .json(new ApiResponse(201, createdQuiz, "Quiz created successfully"));
});

const updateQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { name, questions } = req.body;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  if (name) {
    quiz.name = name;
    await quiz.save();
  }

  if (questions && Array.isArray(questions)) {
    await QuizQuestion.deleteMany({ quiz_id: quizId });
    await QuizQuestion.insertMany(
      questions.map((questionId, index) => ({
        quiz_id: quiz._id,
        question_id: questionId,
        position: index + 1,
      }))
    );
  }

  const updatedQuiz = await getQuizById(quizId);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedQuiz, "Quiz updated successfully"));
});

const deleteQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  await QuizQuestion.deleteMany({ quiz_id: quizId });
  await quiz.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Quiz deleted successfully"));
});

export { createQuiz, getAllQuizzes, getQuizById, updateQuiz, deleteQuiz };
