/*
bookmarked_questions [icon: bookmark, color: Green] {
  user_id ObjectId users 
  question_id ObjectId questions 
  status enum("bookmarked", "marked_for_review")
}

*/

import mongoose, { Schema } from "mongoose";
const bookmarkedQuestionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    question_id: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required!"],
    },
    status: {
      type: String,
      enum: ["bookmarked", "marked_for_review"],
      default: "bookmarked",
    },
  },
  { timestamps: true }
);

export const BookmarkedQuestion = mongoose.model(
  "BookmarkedQuestion",
  bookmarkedQuestionSchema
);
