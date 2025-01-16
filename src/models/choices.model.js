/*
choices [icon: list, color: Purple] {
  id ObjectId pk
  text string
  question_id ObjectId questions 
  is_correct boolean
  explanation string

}
*/
import mongoose, { Schema } from "mongoose";

const choiceSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Text is required!"],
      trim: true,
    },
    question_id: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required!"],
    },
    is_correct: {
      type: Boolean,
      default: false,
    },
    explanation: String,
  },
  { timestamps: true }
);

export const Choice = mongoose.model("Choice", choiceSchema);
