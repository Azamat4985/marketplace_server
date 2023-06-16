import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    phone: {
      type: Number,
    },
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
    goods_quantity: {
      type: Number,
    },
    reviews: {
      type: [String],
    },
    description: {
      type: String,
    },
    region: { type: String },
    city: { type: String },
    address: { type: String },
    zip: { type: String },
    vendor_name: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
