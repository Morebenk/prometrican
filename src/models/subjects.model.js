/*
subjects [icon: book, color: Purple] {
  id ObjectId pk
  name string
}
*/

import mongoose, { Schema } from "mongoose";

const subjectSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Subject = mongoose.model("Subject", subjectSchema);
