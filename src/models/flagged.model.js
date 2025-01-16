/*
flagged_questions [icon: flag, color: Green] {
  user_id ObjectId users 
  question_id ObjectId questions 
  reason enum("Question", "Answer", "Image", "Other")
  flagged_at timestamp
}
*/
import mongoose, { Schema } from "mongoose";

const flaggedQuestionSchema = new Schema(
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
    reason: {
      type: String,
      enum: ["Question", "Answer", "Image", "Other"],
      default: "Other",
    },
  },
  { timestamps: true }
);

export const FlaggedQuestion = mongoose.model(
  "FlaggedQuestion",
  flaggedQuestionSchema
);
