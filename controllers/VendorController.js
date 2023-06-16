import mongoose from "mongoose";
import { Vendor } from "../models/VendorModel.js";
import md5 from "md5";

// Получение всех продавцов
export const getVendors = (req, res) => {
  Vendor.find().then((vendors) => {
    res.send(vendors);
  });
};

// Создание нового продавца
export const newVendor = async (req, res) => {
  let allVendors = await Vendor.find(); // Получение всех продавцов из базы данных
  let vendorFound = false;

  // Проверка, существует ли уже продавец с таким же email
  for (const item of allVendors) {
    if (item.email == req.body.email) {
      vendorFound = true; // Если уже есть продавец с таким email
    }
  }

  if (!vendorFound) {
    // Если продавец не найден, создаем нового продавца
    const vendor = new Vendor({
      email: req.body.email,
      password: md5(req.body.password),
      name: req.body.name,
      avatar: "",
      goods_quantity: 0,
      reviews: [],
      description: req.body.description,
      region: req.body.region,
      city: req.body.city,
      address: req.body.address,
      zip: req.body.zip,
      vendor_name: req.body.vendor_name,
    });

    try {
      const newVendor = await vendor.save(); // Сохранение данных нового продавца в базе данных
      res.send({ success: true, data: newVendor }); // Отправка клиенту сообщения о успешном создании продавца
    } catch (error) {
      console.log(error);
    }
  } else {
    // Если уже существует продавец с таким email
    res.send({ success: false, error: "Продавец с таким Email уже существует" }); // Отправка клиенту сообщения о том, что продавец уже существует
  }
};

// Авторизация продавца
export const loginVendor = async (req, res) => {
  let vendor = await Vendor.find({ email: req.body.email }); // Поиск продавца по email в базе данных

  if (vendor.length == 0) {
    // Если продавец не найден
    res.send("V43"); // Отправка клиенту сообщения о неправильном логине или пароле
  } else {
    vendor = vendor[0];

    if (vendor.password == md5(req.body.password)) {
      // Проверка правильности пароля
      res.send(vendor); // Отправка клиенту данных авторизованного продавца
    } else {
      res.send("V43"); // Отправка клиенту сообщения о неправильном логине или пароле
    }
  }
};

export const changeDataVendor = async (req, res) => {
  let response = {};
  const id = req.body.id;
  let newData = JSON.parse(JSON.stringify(req.body));

  if (await Vendor.findById(id)) {
    await Vendor.findByIdAndUpdate(id, newData, { new: true }).then((newFields) => {
      response.success = true;
      response.data = newFields;
    });
  } else {
    response.success = false;
    response.error = "Продавец с таким ID не найден";
  }

  res.send(response);
};
