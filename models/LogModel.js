import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    type: { type: String },
    field: { type: String },
    msg: { type: String },
  },
  { timestamps: true }
);

export const LogModel = mongoose.model("logs", logSchema);
