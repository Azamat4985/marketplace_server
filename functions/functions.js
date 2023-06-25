import path from "path";
import { LogModel } from "../models/LogModel.js";
import fs from 'fs'

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

// Рекурсивная функция для удаления папки и ее содержимого
export function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);

      if (fs.lstatSync(curPath).isDirectory()) {
        // Рекурсивный вызов для удаления подпапок
        deleteFolderRecursive(curPath);
      } else {
        // Удаление файла
        fs.unlinkSync(curPath);
      }
    });

    // Удаление самой папки
    fs.rmdirSync(folderPath);
    console.log("Папка удалена:", folderPath);
  }
}
