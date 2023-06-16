import express from "express";
import { changeDataVendor, getVendors, loginVendor, newVendor } from "../controllers/VendorController.js";
const vendorRouter = express.Router();

vendorRouter.get('/', getVendors);
vendorRouter.post('/register', newVendor)
vendorRouter.post('/login', loginVendor)
vendorRouter.post('/changeData', changeDataVendor);

export default vendorRouter;