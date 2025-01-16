import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const notificationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    message: {
      type: String,
      required: [true, "Message is required!"],
    },
    type: {
      type: String,
      enum: ["new_questions", "subscription_reminder"],
      default: "new_questions",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.plugin(aggregatePaginate);

export const Notification = mongoose.model("Notification", notificationSchema);
