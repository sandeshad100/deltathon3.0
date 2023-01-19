const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");
exports.renderCreateAmbulanceForm = async (req, res) => {
  res.render("ambulance/createForm");
};
exports.createAmbulance = async (req, res, next) => {
  const userId = req.user.id;
  const { hospitalName, address, phone } = req.body;
  if (!hospitalName || !address || !phone) {
    req.flash("error", "Please fill all the fields");
    return res.redirect(req.headers.referer || "/");
  }
  await sequelize.query(
    " CREATE TABLE ambulance IF NOT EXISTS(id NOT NULL INT PRIMARY KEY AUTO_INCREMENT,userId INT,hospitalName VARCHAR(255),address VARCHAR(255),phone INT,createdAt DATETIME DEFAULT CURRENT_TIMESTAMP) ",
    {
      type: QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    " INSERT INTO ambulance (userId,hospitalName,address,phone) VALUES(?,?,?,?) ",
    {
      type: QueryTypes.INSERT,
      replacements: [userId, hospitalName, address, phone],
    }
  );
  req.flash("success", "Ambulance created successfully");
  res.redirect("/ambulance");
};
exports.renderAmbulanceList = async (req, res, next) => {
  const ambulance = await sequelize.query(" SELECT * FROM ambulance ", {
    type: QueryTypes.SELECT,
  });
  res.render("ambulance/list", { ambulance });
};
exports.renderAmbulanceDetail = async (req, res, next) => {
  const ambulanceId = req.params.id;
  const ambulance = await sequelize.query(
    " SELECT * FROM ambulance WHERE id = ? ",
    {
      type: QueryTypes.SELECT,
      replacements: [ambulanceId],
    }
  );
  res.render("ambulance/detail", { ambulance: ambulance[0] });
};

exports.deleteAmbulance = async (req, res, next) => {
  await sequelize.query("DELETE FROM ambulance WHERE id = ?", {
    type: QueryTypes.DELETE,
    replacements: [req.params.id],
  });
  req.flash("success", "Ambulance deleted successfully");
  res.redirect("/ambulance");
};
