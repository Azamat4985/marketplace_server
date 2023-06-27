import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: false,
    },
    password: {
      type: String,
      default: false,
    },
    phone: {
      type: String,
      default: false,
    },
    name: {
      type: String,
      default: false,
    },
    avatar: {
      type: String,
      default: false,
    },
    goods_quantity: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: false,
    },
    region: { type: String },
    city: { type: String },
    address: { type: String },
    zip: { type: String },
    vendor_name: {
      type: String,
    },
    token: { type: String },
    email_verified: { type: Boolean, default: false },
    bank_details: { type: String, default: "" },
    email_notify: { type: Boolean, default: true },
    push_notify: { type: Boolean, default: true },
    pass_code: { type: String, default: "" },
    sells: {type: Number, default: 0},
    comission_percentage: {type: Number, default: 3}
  },
  { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
