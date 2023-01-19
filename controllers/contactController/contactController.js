const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");
const sendEmail = require("../../utils/email");
const PDFDocument = require("pdfkit");

const { QueryTypes, DataTypes } = require("sequelize");

exports.postContactMessage = async (req, res, next) => {
  const { fullName, email, message } = req.body;
  if (!fullName || !email || !message)
    return next(new AppError("Please provide all fields", 400));
  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS contactMessage(id INT NOT NUll AUTO_INCREMENT PRIMARY KEY,fullName VARCHAR(255),email VARCHAR(255),message VARCHAR(255),createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)",
    {
      type: QueryTypes.CREATE,
    }
  );
  console.log("hellow");
  await sequelize.query(
    "INSERT INTO contactMessage (fullName,email,message) VALUES(?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [fullName, email, message],
    }
  );
  req.flash("success", "Message sent sucessfully");
  res.redirect("/");
};

exports.getContactMessage = async (req, res, next) => {
  const contactMessages = await sequelize.query(
    "SELECT * FROM contactMessage",
    {
      type: QueryTypes.SELECT,
    }
  );
  res.render("contactMessage/list", { contactMessages });
};
