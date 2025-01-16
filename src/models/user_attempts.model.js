import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const userAttemptSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    quiz_id: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: [true, "Quiz ID is required!"],
    },
    score: Number,
    time_spent: Number,
    last_question_position: Number,
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
  },
  { timestamps: true }
);

userAttemptSchema.plugin(aggregatePaginate);

export const UserAttempt = mongoose.model("UserAttempt", userAttemptSchema);
