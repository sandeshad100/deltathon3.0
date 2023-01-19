const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.renderCreateDonorHistoryForm = async (req, res) => {
  res.render("donorHistory/createForm");
};
exports.createDonorHistory = async (req, res) => {
  const { date, pints } = req.body;
  const name = req.body.name || " ";
  const Case = req.body.case || " ";
  const bloodBankName = req.body.bloodBankName || " ";
  const { id } = req.user;
  if (!date || !pints) {
    req.flash("error", "Please provide all fields");
    return res.redirect("/");
  }
  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS donorHistory (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,userId INT,name VARCHAR(255),date VARCHAR(255),pints VARCHAR(255),Case VARCHAR(255),bloodBankName VARCHAR(255),createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)",
    {
      type: QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    "INSERT INTO donorHistory(userId,name,date,pints,Case,bloodBankName) VALUES(?,?,?,?,?,?) ",
    {
      type: QueryTypes.INSERT,
      replacements: [id, name, date, pints, Case, bloodBankName],
    }
  );
  req.flash("sucess", "Created donation history sucessfully");
  res.redirect("/donationHistory");
};

exports.getDonationHistory = async (req, res, next) => {
  const donationHistory = await sequelize.query(
    "SELECT * FROM donorHistory WHERE userId=?",
    {
      type: QueryTypes.SELECT,
      replacements: [req.user.id],
    }
  );
  if (!donationHistory) {
    req.flash("error", "Cannot find any history for that id");
    return res.redirect(req.headers.referer || "/");
  }

  res.render("donationHistory/showIndividual", { donationHistory });
};
exports.deleteDonorHistory = async (req, res, next) => {
  await sequelize.query("DELETE FROM donorHistory where userId=? AND id=?", {
    types: QueryTypes.DELETE,
    replacements: [req.user.id, req.params.id],
  });
  req.flash("success", "Delete donor history sucessfully");
  res.redirect("/donorHistory");
};
