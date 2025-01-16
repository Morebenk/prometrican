import { Question } from "../models/questions.model.js";
import { Category } from "../models/categories.model.js";
import { Choice } from "../models/choices.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createQuestion = asyncHandler(async (req, res) => {
  const { text, category_id, image_urls = [], choices } = req.body;

  if (!text || !category_id || !choices || !Array.isArray(choices)) {
    throw new ApiError(
      400,
      "Text, category_id, and choices array are required"
    );
  }

  if (choices.length < 2) {
    throw new ApiError(400, "At least two choices are required");
  }

  const hasCorrectAnswer = choices.some((choice) => choice.is_correct);
  if (!hasCorrectAnswer) {
    throw new ApiError(400, "At least one correct answer must be specified");
  }

  // Verify category exists
  const category = await Category.findById(category_id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Create question
  const question = await Question.create({
    text,
    category_id,
    image_urls,
  });

  // Create choices
  const choicePromises = choices.map((choice) => {
    return Choice.create({
      text: choice.text,
      question_id: question._id,
      is_correct: choice.is_correct,
      explanation: choice.explanation,
    });
  });

  const createdChoices = await Promise.all(choicePromises);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        question,
        choices: createdChoices,
      },
      "Question created successfully"
    )
  );
});

const getQuestionsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const questions = await Question.aggregate([
    { $match: { category_id: category._id } },
    {
      $lookup: {
        from: "choices",
        localField: "_id",
        foreignField: "question_id",
        as: "choices",
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  const total = await Question.countDocuments({ category_id: categoryId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        questions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      "Questions retrieved successfully"
    )
  );
});

const updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { text, image_urls, choices } = req.body;

  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Update question
  if (text) question.text = text;
  if (image_urls) question.image_urls = image_urls;
  await question.save();

  // Update choices if provided
  if (choices && Array.isArray(choices)) {
    if (choices.length < 2) {
      throw new ApiError(400, "At least two choices are required");
    }

    const hasCorrectAnswer = choices.some((choice) => choice.is_correct);
    if (!hasCorrectAnswer) {
      throw new ApiError(400, "At least one correct answer must be specified");
    }

    // Delete existing choices
    await Choice.deleteMany({ question_id: questionId });

    // Create new choices
    const choicePromises = choices.map((choice) => {
      return Choice.create({
        text: choice.text,
        question_id: question._id,
        is_correct: choice.is_correct,
        explanation: choice.explanation,
      });
    });

    await Promise.all(choicePromises);
  }

  // Fetch updated question with choices
  const updatedQuestion = await Question.aggregate([
    { $match: { _id: question._id } },
    {
      $lookup: {
        from: "choices",
        localField: "_id",
        foreignField: "question_id",
        as: "choices",
      },
    },
  ]).then((results) => results[0]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedQuestion, "Question updated successfully")
    );
});

const deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Delete choices first
  await Choice.deleteMany({ question_id: questionId });

  // Delete question
  await question.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Question and associated choices deleted successfully"
      )
    );
});

export {
  createQuestion,
  getQuestionsByCategory,
  updateQuestion,
  deleteQuestion,
};
