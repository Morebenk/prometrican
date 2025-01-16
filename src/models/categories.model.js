/*
categories [icon: folder, color: Purple] {
  id ObjectId pk
  name string
  subject_id ObjectId subjects 
}
*/

import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
    },
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject ID is required!"],
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
