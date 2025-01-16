/*
quizzes [icon: clipboard, color: Purple] {
  id ObjectId pk
  name string
  created_at timestamp
}
*/
import mongoose, { Schema } from "mongoose";

const quizSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model("Quiz", quizSchema);
