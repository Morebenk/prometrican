/*
user_answers [icon: check-circle] {
  id ObjectId pk
  attempt_id ObjectId user_attempts 
  question_id ObjectId questions 
  selected_choice_id ObjectId choices 
}

*/
import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const userAnswerSchema = new Schema(
  {
    attempt_id: {
      type: Schema.Types.ObjectId,
      ref: "UserAttempt",
      required: [true, "Attempt ID is required!"],
    },
    question_id: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required!"],
    },
    selected_choice_id: {
      type: Schema.Types.ObjectId,
      ref: "Choice",
      required: [true, "Selected Choice ID is required!"],
    },
  },
  { timestamps: true }
);
userAnswerSchema.plugin(aggregatePaginate);

export const UserAnswer = mongoose.model("UserAnswer", userAnswerSchema);
