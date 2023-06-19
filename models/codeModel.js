import mongoose from "mongoose";

const codeSchema = new mongoose.Schema({
  phone: { type: String },
  code: { type: String },
}, {timestamps: true});

export const SmsCode = mongoose.model("sms_codes", codeSchema);
