/*
wrong_answers [icon: x, color: Green] {
  user_id ObjectId users 
  question_id ObjectId questions 
  updated_at timestamp
}
*/

import mongoose, { Schema } from "mongoose";

const wrongAnswerSchema = new Schema(
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
  },
  { timestamps: true }
);

export const WrongAnswer = mongoose.model("WrongAnswer", wrongAnswerSchema);
