const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.renderHomePage = async (req, res, next) => {
  await sequelize.query(
    " CREATE TABLE IF NOT EXISTS bloodGroup(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255))",
    {
      type: QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS events(id INT NOT NUll AUTO_INCREMENT PRIMARY KEY,title VARCHAR(255),description VARCHAR(255),address VARCHAR(255),phone VARCHAR(255),province VARCHAR(255),district VARCHAR(255),localLevel VARCHAR(255),time DATETIME,streetAddress VARCHAR(255),imagePath VARCHAR(255), createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,date DATE)`,
    {
      types: QueryTypes.CREATE,
    }
  );
  const bloodGroup = await sequelize.query("SELECT * FROM bloodGroup", {
    type: QueryTypes.SELECT,
  });
  if (bloodGroup.length == 0) {
    await sequelize.query(
      "INSERT INTO bloodGroup (name) VALUES ('A+'),('A-'),('B+'),('B-'),('AB+'),('AB-'),('O+'),('O-')",
      {
        type: QueryTypes.INSERT,
      }
    );
  }

  const events = await sequelize.query("SELECT * FROM events", {
    type: QueryTypes.SELECT,
  });

  res.render("home/index", { events });
};
