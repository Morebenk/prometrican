import { Subject } from "../models/subjects.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createSubject = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  const existingSubject = await Subject.findOne({ name: name.toLowerCase() });
  if (existingSubject) {
    throw new ApiError(409, "Subject already exists");
  }

  const subject = await Subject.create({
    name: name.toLowerCase(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subject, "Subject created successfully"));
});

const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({});
  return res
    .status(200)
    .json(new ApiResponse(200, subjects, "Subjects retrieved successfully"));
});

const getSubjectById = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const subject = await Subject.findById(subjectId);

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subject, "Subject retrieved successfully"));
});

const updateSubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  const subject = await Subject.findByIdAndUpdate(
    subjectId,
    { name: name.toLowerCase() },
    { new: true }
  );

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subject, "Subject updated successfully"));
});

const deleteSubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const subject = await Subject.findByIdAndDelete(subjectId);

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subject deleted successfully"));
});

export {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
