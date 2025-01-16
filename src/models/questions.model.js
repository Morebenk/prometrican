/*
questions [icon: help-circle, color: Purple] {
  id ObjectId pk
  text string
  image_urls string[] // array of image URLs
  category_id ObjectId categories 
}
*/
import mongoose, { Schema } from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const questionSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Text is required!"],
      trim: true,
    },
    image_urls: [String],
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required!"],
    },
  },
  { timestamps: true }
);

questionSchema.plugin(aggregatePaginate);

export const Question = mongoose.model("Question", questionSchema);
