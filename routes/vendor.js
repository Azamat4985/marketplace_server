import express from "express";
import { changeDataVendor, checkCode, checkToken, getAvatar, getReviews, getVendors, loginVendor, logout, newVendor, sendCode, test } from "../controllers/VendorController.js";
const vendorRouter = express.Router();

vendorRouter.get("/", getVendors);
vendorRouter.post("/register", newVendor);
vendorRouter.post("/login", loginVendor);
vendorRouter.post("/changeData", changeDataVendor);
vendorRouter.post("/sendCode", sendCode);
vendorRouter.post("/checkCode", checkCode);
vendorRouter.post("/test", test);
vendorRouter.post("/checkToken", checkToken);
vendorRouter.post("/logout", logout);
vendorRouter.post("/getAvatar", getAvatar);
vendorRouter.post("/getReviews", getReviews);


export default vendorRouter;
