import { Category } from "../models/categories.model.js";
import { Subject } from "../models/subjects.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, subject_id } = req.body;

  if (!name || !subject_id) {
    throw new ApiError(400, "Name and subject_id are required");
  }

  // Verify subject exists
  const subject = await Subject.findById(subject_id);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  const existingCategory = await Category.findOne({
    name: name.toLowerCase(),
    subject_id,
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists in this subject");
  }

  const category = await Category.create({
    name: name.toLowerCase(),
    subject_id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, category, "Category created successfully"));
});

const getCategoriesBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  const categories = await Category.find({ subject_id: subjectId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, categories, "Categories retrieved successfully")
    );
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    { name: name.toLowerCase() },
    { new: true }
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});

export {
  createCategory,
  getCategoriesBySubject,
  updateCategory,
  deleteCategory,
};
