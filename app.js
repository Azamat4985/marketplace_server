import express from "express";
import vendorRouter from "./routes/vendor.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import bodyParser from "body-parser";
import serviceRouter from "./routes/service.js";
import fileUpload from "express-fileupload";
import http from "http";

const app = express();
const server = http.createServer(app);
// Парсинг тела запроса в формате JSON
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cors({ origin: "*" }));

// Парсинг данных формы, отправленных через multipart/form-data
// const forms = multer();
// app.use(forms.array());

// Обработка фото
app.use(fileUpload());

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
app.use("/service", serviceRouter);

// Запуск сервера
app.listen(PORT, (error) => {
  if (!error) console.log("Server is Successfully Running, and App is listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
