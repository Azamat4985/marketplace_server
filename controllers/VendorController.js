import mongoose from "mongoose";
import { Vendor } from "../models/VendorModel.js";
import md5 from "md5";

export const getVendors = (req, res) => {
  Vendor.find().then((vendors) => {
    res.send(vendors);
  });
};

export const newVendor = async (req, res) => {
  let allVendors = await Vendor.find(); // все продавцы
  let vendorFound = false;
  for (const item of allVendors) {
    if (item.email == req.body.email) {
      vendorFound = true; // если уже такой вендор есть
    }
  }
  if (!vendorFound) { // если вендор не найден
    const vendor = new Vendor({
      email: req.body.email,
      password: md5(req.body.password),
      name: req.body.name,
      avatar: "",
      goods_quantity: 0,
      reviews: [],
      description: req.body.description,
      location: {
        region: req.body.region,
        city: req.body.city,
        address: req.body.address,
        zip: req.body.zip,
      },
      vendor_name: req.body.vendor_name
    });
    try {
      const newVendor = await vendor.save(); // сохраняем данные
      res.send("V0");
    } catch (error) {
      console.log(error);
    }
  } else { // если уже вендор есть
    res.send("V41");
  }
};

export const loginVendor = async (req, res) => {
  let vendor = await Vendor.find({ email: req.body.email });
  if (vendor.length == 0) {
    res.send("V43");
  } else {
    vendor = vendor[0];
    console.log(vendor.password);
    if (vendor.password == md5(req.body.password)) {
      res.send(vendor);
    } else {
      res.send("V43");
    }
  }
};
