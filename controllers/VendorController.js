import mongoose from "mongoose";
import { Vendor } from "../models/VendorModel.js";
import md5 from "md5";
import { SmsCode } from "../models/codeModel.js";

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
      email: req.body.email, // from client
      password: md5(req.body.password), // from client
      name: req.body.name, // from client
      avatar: "",
      goods_quantity: 0,
      reviews: [],
      description: req.body.description, // from clien
      region: req.body.region, // from clien
      city: req.body.city, // from clien
      address: req.body.address, // from clien
      zip: req.body.zip, // from clien
      vendor_name: req.body.vendor_name, // from clien
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

export const sendCode = async (req, res) => {
  const phone = req.body.phone;
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
        saveNewCode();
        res.send({ success: true });
      });
    } else {
      res.send({ success: false, error: `Попробуйте через ${Math.abs(currentTime.getSeconds() - target.getSeconds())}` });
    }
  } else {
    saveNewCode();
    res.send({ success: true });
  }

  async function saveNewCode() {
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

  const record = await SmsCode.findOne({phone: phone});
  if(record){
    if(record.code == code){
      res.send({success: true})
    } else {
      res.send({success: false, error: "Неверный код"})
    }
  } else {
    res.send({success: false, error: "Такой номер телефона не найден"})
  }
  

}
