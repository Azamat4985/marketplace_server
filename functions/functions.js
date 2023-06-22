import { LogModel } from "../models/LogModel.js";

export function saveLog(type, field, msg) {
  return new LogModel({
    type: type,
    field: field,
    msg: msg,
  }).save();
}

export function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}