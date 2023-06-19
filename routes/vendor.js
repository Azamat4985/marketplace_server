import express from "express";
import { changeDataVendor, checkCode, getVendors, loginVendor, newVendor, sendCode } from "../controllers/VendorController.js";
const vendorRouter = express.Router();

vendorRouter.get('/', getVendors);
vendorRouter.post('/register', newVendor)
vendorRouter.post('/login', loginVendor)
vendorRouter.post('/changeData', changeDataVendor);
vendorRouter.post('/sendCode', sendCode)
vendorRouter.post('/checkCode', checkCode)

export default vendorRouter;