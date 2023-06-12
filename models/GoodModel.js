import mongoose from "mongoose";

const good = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  vendor_id: { type: String },
  sizes: { type: [String] },
  colors: { type: [String] },
  main_photo: { type: String },
  photos: { type: [String] },
  stock: { type: Number },
  reviews: { type: [String] },
  material: { type: String },
  description: { type: String },
  discounts: [
    {
      good_id: { type: String },
      percent: { type: Number },
      start: { type: Date },
      end: { type: Date },
    },
  ],
});

export const Good = mongoose.model("Good", good);
