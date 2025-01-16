/*
subscriptions [icon: dollar-sign, color: blue] {
  id ObjectId pk
  user_id ObjectId users 
  subject_id ObjectId subjects 
  start_date timestamp
  end_date timestamp
  plan_duration number // in months
}
*/
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required!"],
    },
    start_date: Date,
    end_date: Date,
    plan_duration: {
      type: Number,
      required: [true, "Plan duration is required!"],
    },
  },
  { timestamps: true }
);
subscriptionSchema.plugin(aggregatePaginate);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
