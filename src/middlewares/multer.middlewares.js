import multer from "multer";

// Middleware to parse multipart/form-data for all routes
const parseFormData = multer().none(); // Use `none()` for non-file form-data

export { parseFormData };
