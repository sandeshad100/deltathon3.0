require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require("twilio")(accountSid, authToken);
const User = require("../model/userModel");

exports.sendMessage = async (message, phone) => {
  try {
    const success = await twilio.messages.create({
      body: message,
      from: process.env.FROM_NUMBER,
      to: phone,
    });
    console.log(success);
  } catch (error) {
    console.log(error);
  }
};
