import express from "express";
import vendorRouter from "./routes/vendor.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import bodyParser from "body-parser";
import multer from "multer";

const forms = multer();

const app = express();

// Парсинг тела запроса в формате JSON
app.use(bodyParser.json());

// Парсинг данных формы
app.use(bodyParser.urlencoded({ extended: true }));

// Парсинг данных формы, отправленных через multipart/form-data
app.use(forms.array());

const PORT = 3000;

// Загрузка переменных окружения из файла .env
config();

// Подключение к базе данных MongoDB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.on("open", () => console.log("DB Connected"));

// Маршруты для операций с продавцами
app.use("/vendor", vendorRouter);

// Запуск сервера
app.listen(PORT, (error) => {
  if (!error) console.log("Server is Successfully Running, and App is listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
