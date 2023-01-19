const jwt = require("jsonwebtoken");
const { promisify } = require("util");
// const User = require('../model/userModel')
const db = require("../model/index");
const AppError = require("./appError");
const User = db.users;

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.render("error/pathError", {
        message: "You don't have permission to do that",
        code: 403,
      });
    }
    next();
  };
};
