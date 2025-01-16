import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Check if the error is not an instance of ApiError and construct one
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || "Something went wrong!";
    error = new ApiError(statusCode, error.errors || [], err.stack, message);
  }

  // Prepare the error response
  const response = {
    success: error.success,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
