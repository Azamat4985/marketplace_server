import express from "express";
import vendorRouter from "./routes/vendor.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import bodyParser from "body-parser";
import multer from "multer";

const forms = multer();

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(forms.array())
const PORT = 3000;

config();
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.on("open", () => console.log("DB Connected"));

app.use("/vendor", vendorRouter);

app.listen(PORT, (error) => {
  if (!error) console.log("Server is Successfully Running, and App is listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
