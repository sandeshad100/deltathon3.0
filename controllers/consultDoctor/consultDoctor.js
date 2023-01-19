const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");
const { default: axios } = require("axios");
const { sendMessage } = require("../../utils/sendMessage");

// exports.renderConsultDoctorPage = async (req, res, next) => {
//   try {
//     const provinces = await sequelize.query("SELECT * FROM provinces", {
//       type: sequelize.QueryTypes.SELECT,
//     });
//   } catch (err) {
//     res.render("error/pathError", { message: err.message, code: 500 });
//   }
//   res.render("consultDoctor/consultDoctorPage");
// };
exports.renderCreateDoctor = async (req, res, next) => {
  const provinces = await sequelize.query("SELECT * FROM provinces", {
    type: sequelize.QueryTypes.SELECT,
  });

  res.render("consultDoctor/createDoctor", { provinces });
};

exports.createDoctor = async (req, res, next) => {
  const { name, speciality, level, status, phone, province, district } =
    req.body;
  const data = await axios.post("http://localhost:3000/create-meeting-room");
  const roomId = data.data.roomName;
  const availableTime = "7 pm to 8 pm";
  const generateDoctorId = Math.floor(100000 + Math.random() * 900000);
  const doctorId = "DOC_" + generateDoctorId;
  try {
    await sequelize.query(
      "CREATE TABLE IF NOT EXISTS doctors(doctorId VARCHAR(255)  PRIMARY KEY,name VARCHAR(255),speciality VARCHAR(255),level VARCHAR(255),status VARCHAR(255),phone VARCHAR(255),province VARCHAR(255),district VARCHAR(255),roomId VARCHAR(255),availableTime VARCHAR(255) ) ",
      {
        type: sequelize.QueryTypes.CREATE,
      }
    );
    await sequelize.query(
      "INSERT INTO doctors(doctorId,name,speciality,level,status,phone,province,district,roomId,availableTime) VALUES(?,?,?,?,?,?,?,?,?,?)",
      {
        replacements: [
          doctorId,
          name,
          speciality,
          level,
          status || "availiable",
          phone,
          province,
          district,
          roomId,
          availableTime,
        ],
        type: sequelize.QueryTypes.INSERT,
      }
    );
    res.redirect("/consultDoctor");
  } catch (error) {
    res.render("error/pathError", { message: error.message, code: 500 });
  }
};

exports.getDoctors = async (req, res, next) => {
  const speciality = req.query.speciality;
  const province = req.query.province;
  const district = req.query.district;

  let doctors;
  if (!province && !district && !speciality) {
    // if no query parameters are provided, retrieve all users
    try {
      doctors = await sequelize.query(`SELECT * FROM doctors`, {
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      doctors = [];
    }
  } else if (!province && !district) {
    // if only the speciality parameter is provided, filter by speciality

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE speciality='${speciality}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
  } else if (!province && !speciality) {
    // if only the district parameter is provided, filter by district

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE district='${district}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
  } else if (!district && !speciality) {
    // if only the province parameter is provided, filter by province

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE province='${province}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
  } else if (!province) {
    // if district and speciality parameters are provided, filter by both

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE speciality='${speciality}' AND district='${district}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
  } else if (!district) {
    // if province and speciality parameters are provided, filter by both

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE speciality='${speciality}' AND province='${province}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
  } else if (!speciality) {
    // if province and district parameters are provided, filter by both

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE province='${province}' AND district='${district}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
  } else {
    // if all parameters are provided, filter by all

    doctors = await sequelize.query(
      `SELECT * FROM doctors WHERE speciality='${speciality}' AND district='${district}' AND province='${province}' `,
      {
        type: QueryTypes.SELECT,
      }
    );
  }
  try {
    var provinces = await sequelize.query("SELECT * FROM provinces", {
      type: QueryTypes.SELECT,
    });
  } catch (error) {
    provinces = [];
  }
  if (!doctors)
    return res.render("error/pathError", {
      message: "No doctors found",
      code: 400,
    });

  res.render("consultDoctor/consultDoctorPage", { doctors, provinces });
};

exports.messageToDoctor = async (req, res, next) => {
  console.log(req.body);
  sendMessage(req.body.message, req.body.phone);
  res.redirect("/call");
};
