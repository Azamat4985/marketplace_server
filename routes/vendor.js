import express from "express";
import { changeDataVendor, changePassCode, changePassword, checkCode, checkToken, getAvatar, getPassCode, getReviews, getVendors, loginVendor, logout, newVendor, sendCode, test } from "../controllers/VendorController.js";
const vendorRouter = express.Router();

vendorRouter.get("/", getVendors);
vendorRouter.post("/register", newVendor);
vendorRouter.post("/login", loginVendor);
vendorRouter.post("/changeData", changeDataVendor);
vendorRouter.post("/changePassword", changePassword);
vendorRouter.post('/changePassCode', changePassCode)
vendorRouter.post("/sendCode", sendCode);
vendorRouter.post("/checkCode", checkCode);
vendorRouter.post("/test", test);
vendorRouter.post("/checkToken", checkToken);
vendorRouter.post("/logout", logout);
vendorRouter.post("/getAvatar", getAvatar);
vendorRouter.post("/getReviews", getReviews);
vendorRouter.post('/getPassCode', getPassCode)


export default vendorRouter;
