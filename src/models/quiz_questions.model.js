/*
quiz_questions [icon: link, color: Purple] {
  quiz_id ObjectId quizzes 
  question_id ObjectId questions 
  position number
}
*/
import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const quizQuestionSchema = new Schema({
  quiz_id: {
    type: Schema.Types.ObjectId,
    ref: "Quiz",
    required: [true, "Quiz ID is required!"],
  },
  question_id: {
    type: Schema.Types.ObjectId,
    ref: "Question",
    required: [true, "Question ID is required!"],
  },
  position: {
    type: Number,
    required: [true, "Position is required!"],
  },
});

quizQuestionSchema.plugin(aggregatePaginate);

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
