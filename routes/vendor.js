import express from "express";
import { getVendors, loginVendor, newVendor } from "../controllers/VendorController.js";
const vendorRouter = express.Router();

vendorRouter.get('/', getVendors);
vendorRouter.post('/register', newVendor)
vendorRouter.post('/login', loginVendor)

export default vendorRouter;