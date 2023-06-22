import mongoose from "mongoose";
import { Vendor } from "../models/VendorModel.js";
import md5 from "md5";
import { SmsCode } from "../models/codeModel.js";
import fs from "fs";
import sharp from "sharp";
import crypto from "crypto";
import { sendMsgWs } from "./WebsocketController.js";
import { saveLog } from "../functions/functions.js";

export const test = (req, res) => {
  let toClient = req.body.clientId;

  sendMsgWs(toClient, "test", "testMsg");
  res.send(200)
};

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

  let requestData = JSON.parse(req.body.vendorData);

  // Проверка, существует ли уже продавец с таким же email
  for (const item of allVendors) {
    if (item.email == req.body.email) {
      vendorFound = true; // Если уже есть продавец с таким email
    }
  }

  if (!vendorFound) {
    // Если продавец не найден, создаем нового продавца
    console.log(requestData);
    let randomToken = crypto.randomBytes(16).toString("hex");
    const vendor = new Vendor({
      email: requestData.email, // from client
      password: md5(requestData.password), // from client
      name: requestData.name, // from client
      avatar: "",
      goods_quantity: 0,
      reviews: [],
      description: requestData.description, // from clien
      region: requestData.region, // from clien
      city: requestData.city, // from clien
      address: requestData.address, // from clien
      zip: requestData.zip, // from clien
      vendor_name: requestData.vendor_name, // from clien
      token: crypto.randomBytes(16).toString("hex"),
    });

    try {
      const newVendor = await vendor.save(); // Сохранение данных нового продавца в базе данных
      const vendorId = newVendor._id;
      let files = req.files;
      if (files) {
        fs.mkdirSync("files/avatars/" + vendorId);
        sharp(files.avatar.data)
          .jpeg({ quality: 50 })
          .toFile(`files/avatars/${vendorId}/` + `${vendorId}.jpg`, async (err, info) => {
            if (err) {
              await Vendor.deleteOne({ email: requestData.email });
              console.log("Ошибка, удалена запись");
              console.log(err);
              res.send({ success: false, error: "Не удалось сохранить фото" });
            }
          });
        let path = `files/avatars/${vendorId}/${vendorId}.jpg`;

        await Vendor.findByIdAndUpdate(vendorId, {
          avatar: path,
        });
      } else {
        await Vendor.findByIdAndUpdate(vendorId, {
          avatar: "files/avatars/default.jpg",
        });
      }

      saveLog("info", "vendor", `New account ${requestData.email}`);
      res.send({ success: true, data: newVendor }); // Отправка клиенту сообщения о успешном создании продавца
    } catch (error) {
      await Vendor.deleteOne({ email: requestData.email });
      console.log("Ошибка, удалена запись");
      console.log(error);
      saveLog("error", "vendor", `Could not save avatar ${requestData.email}`);
      res.send({ success: false, error: "Не удалось сохранить фото" });
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
    res.send({ success: false, error: "Неправильный email или пароль" }); // Отправка клиенту сообщения о неправильном логине или пароле
  } else {
    vendor = vendor[0];

    if (vendor.password == md5(req.body.password)) {
      // Проверка правильности пароля
      saveLog("info", "vendor", `Login account ${req.body.email}`);
      res.send({ success: true, data: vendor }); // Отправка клиенту данных авторизованного продавца
    } else {
      saveLog("info", "vendor", `Wrong email or password ${req.body.email}`);
      res.send({ success: false, error: "Неправильный email или пароль" }); // Отправка клиенту сообщения о неправильном логине или пароле
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
      saveLog("info", "vendor", `Account data changed ${id}`);
    });
  } else {
    response.success = false;
    response.error = "Продавец с таким ID не найден";
  }

  res.send(response);
};

export const sendCode = async (req, res) => {
  const phone = req.body.phone;
  console.log("senCode", req.body.phone);
  let randomCode = "";
  for (var i = 0; i < 4; i++) {
    randomCode += Math.floor(Math.random() * 10);
  }

  let record = await SmsCode.findOne({ phone: phone });
  if (record) {
    let target = new Date(record.createdAt);
    let currentTime = new Date();

    target.setSeconds(target.getSeconds() + 30);

    if (currentTime > target) {
      record.deleteOne().then(() => {
        saveNewCode(phone);
        res.send({ success: true });
      });
    } else {
      res.send({ success: false, error: `Попробуйте через ${Math.abs(currentTime.getSeconds() - target.getSeconds())}` });
    }
  } else {
    saveNewCode(phone);
    res.send({ success: true });
  }

  async function saveNewCode(phone) {
    console.log("saveNewCode", phone);
    saveLog("info", "vendor", `Sms send to ${phone} with code ${randomCode}`);
    const newCode = new SmsCode({
      phone: phone,
      code: randomCode,
    });

    try {
      const newRecord = await newCode.save();
      console.log(newRecord);
    } catch (error) {}
  }
};

export const checkCode = async (req, res) => {
  const phone = req.body.phone;
  const code = req.body.code;

  const record = await SmsCode.findOne({ phone: phone });
  if (record) {
    if (record.code == code) {
      saveLog("info", "vendor", `Code correct. Phone: ${phone}, code: ${code}`);
      res.send({ success: true });
    } else {
      saveLog("info", "vendor", `Code incorrect. Phone: ${phone}, code: ${code}`);
      res.send({ success: false, error: "Неверный код" });
    }
  } else {
    res.send({ success: false, error: "Такой номер телефона не найден" });
  }
};

export const checkToken = async (req, res) => {
  const token = req.body.token;

  let vendorWithToken = await Vendor.findOne({ token: token });
  if (vendorWithToken) {
    if (vendorWithToken.token == token) {
      saveLog("info", "vendor", `Token correct. Email: ${vendorWithToken.email}`);
      res.send({ success: true, data: vendorWithToken });
    } else {
      saveLog("info", "vendor", `Token correct. Email: ${vendorWithToken.email}`);
      res.send({ success: false, error: "Неверный токен" });
    }
  }
};

export const logout = async (req, res) => {
  let email = req.body.email;
  saveLog("info", "vendor", `Logout. Email: ${email}`);
  res.send({ success: true });
};
