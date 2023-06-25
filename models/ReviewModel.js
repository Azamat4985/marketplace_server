import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: String },
    text: { type: String },
    photos: { type: [String] },
    stars: { type: Number },
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.model("reviews", reviewSchema);
