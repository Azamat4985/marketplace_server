import mongoose from "mongoose";
import { Vendor } from "../models/VendorModel.js";
import md5 from "md5";
import { SmsCode } from "../models/codeModel.js";
import fs from "fs";
import sharp from "sharp";
import crypto from "crypto";
import { sendMsgWs } from "./WebsocketController.js";
import { deleteFolderRecursive, saveLog } from "../functions/functions.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { __dirname } from "../app.js";
import { ReviewModel } from "../models/ReviewModel.js";

export const test = (req, res) => {
  let toClient = req.body.clientId;

  sendMsgWs(toClient, "test", "testMsg");
  res.send(200);
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
    if (item.email == requestData.email) {
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
      phone: requestData.phone,
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
        fs.mkdirSync("files/avatars/" + vendorId);
        await Vendor.findByIdAndUpdate(vendorId, {
          avatar: `files/avatars/${vendorId}/default_avatar.jpg`,
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
  const avatarAction = req.body.avatarAction;
  let newData = JSON.parse(req.body.vendorData);
  let oldData = await Vendor.findById(id);

  if (oldData) {
    new Promise((resolve, reject) => {
      if (avatarAction == "stay") {
        // nothing
      } else if (avatarAction == "change") {
        const files = req.files;

        fs.access(path.join(__dirname, oldData.avatar), fs.constants.F_OK, (err) => {
          if (err) {
            // если папки нет
            fs.mkdirSync("files/avatars/" + id);
            sharp(files.avatar.data)
              .jpeg({ quality: 50 })
              .toFile(`files/avatars/${id}/` + `${id}.jpg`, async (err, info) => {
                if (err) {
                  reject();
                  res.send({ success: false, error: "Не удалось сохранить фото" });
                }
              });
            newData.avatar = `files/avatars/${id}/${id}.jpg`;
            resolve();
          }

          // если папка есть
          deleteFolderRecursive(`files/avatars/${id}`);
          fs.mkdirSync("files/avatars/" + id);
          sharp(files.avatar.data)
            .jpeg({ quality: 50 })
            .toFile(`files/avatars/${id}/` + `${id}.jpg`, async (err, info) => {
              if (err) {
                reject();
                res.send({ success: false, error: "Не удалось сохранить фото" });
              }
            });
          newData.avatar = `files/avatars/${id}/${id}.jpg`;

          resolve();
          console.log("=======================");
          console.log(newData);
          console.log("=======================");
        });
      } else if (avatarAction == "delete") {
        deleteFolderRecursive(`files/avatars/${id}`);
        newData.avatar = "files/avatars/default_avatar.jpg";
        resolve();
      }
    }).then(async () => {
      console.log("++++++++++++++++++++++++");
      console.log(newData);
      console.log("++++++++++++++++++++++++");
      await Vendor.findByIdAndUpdate(id, newData, { new: true }).then((newFields) => {
        res.send({ success: true, data: newFields });
        saveLog("info", "vendor", `Account data changed ${id}`);
      });
    });
  } else {
    response.success = false;
    response.error = "Продавец с таким ID не найден";
    res.send(response);
  }
};

export const sendCode = async (req, res) => {
  const phone = req.body.phone;

  let vendorWithThisPhone = await Vendor.findOne({ phone: phone });
  console.log("vendorWithThisPhone", vendorWithThisPhone);

  if (vendorWithThisPhone == null) {
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
  } else {
    res.send({ success: false, error: "Такой телефон уже зарегистрован в системе" });
  }

  async function saveNewCode(phone) {
    console.log("saveNewCode", phone);
    let randomCode = "";
    for (var i = 0; i < 4; i++) {
      randomCode += Math.floor(Math.random() * 10);
    }
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
      await SmsCode.deleteOne({ phone: phone });
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
      // saveLog("info", "vendor", `Token correct. Email: ${vendorWithToken.email}`);
      res.send({ success: true, data: vendorWithToken });
    } else {
      // saveLog("info", "vendor", `Token incorrect. Email: ${vendorWithToken.email}`);
      res.send({ success: false, error: "Неверный токен" });
    }
  } else {
    res.send({ success: false, error: "Такого пользователя не существует" });
  }
};

export const logout = async (req, res) => {
  let email = req.body.email;
  saveLog("info", "vendor", `Logout. Email: ${email}`);
  res.send({ success: true });
};

export const getAvatar = async (req, res) => {
  let id = req.body.id;

  let vendor = await Vendor.findById(id);
  if (vendor) {
    let file = path.join(__dirname, vendor.avatar);
    if (file) {
      res.sendFile(file);
    }
  } else {
    res.send({ success: false, error: "no vendor" });
  }
};

export const getReviews = async (req, res) => {
  let id = req.body.id;
  let arr = [];

  let vendor = await Vendor.findById(id);
  if (vendor) {
    let reviewsArr = vendor.reviews;
    for (const id of reviewsArr) {
      let review = await ReviewModel.findById(id);
      arr.push(review);
    }
    res.send({ success: true, data: arr });
  } else {
    res.send({ success: false, error: "no vendor" });
  }
};

export const changePassword = async (req, res) => {
  const id = req.body.id;
  let oldPassword = req.body.oldPassword;
  let newPassword = req.body.newPassword;

  let vendor = await Vendor.findById(id);
  if (vendor != null) {
    if (md5(oldPassword) == vendor.password) {
      await Vendor.findByIdAndUpdate(id, { password: md5(newPassword) }, { new: true })
        .then(() => {
          res.send({ success: true });
        })
        .catch((err) => {
          res.send({ success: false, error: err });
        });
    } else {
      res.send({ success: false, error: "Неправильный старый пароль" });
    }
  } else {
    res.send({ success: false, error: "Такого продавца не существует" });
  }
};

export const changePassCode = async (req, res) => {
  const id = req.body.id;
  const newCode = req.body.newCode;
  const oldCode = req.body.oldCode;

  let vendor = await Vendor.findById(id);
  if (vendor != null) {
    if (vendor.pass_code == "") {
      vendor.pass_code = newCode;
      await vendor.save();
      res.send({ success: true, data: "Код-пароль успешно сохранен" });
    } else {
      if (vendor.pass_code == oldCode) {
        vendor.pass_code = newCode;
        await vendor.save();
        res.send({ success: true, data: "Код-пароль успешно сохранен" });
      } else {
        res.send({ success: false, error: "Неверный старый код-пароль" });
      }
    }
  } else {
    res.send({ success: false, error: "Продавца с таким ID не существует" });
  }
};

export const getPassCode = async (req, res) => {
  const id = req.body.id;

  let vendor = await Vendor.findById(id);
  if(vendor != null){
    res.send({success: true, data: vendor.pass_code})
  } else {
    res.send({success: false, error: "Такого продавца нет"})
  }
};
