const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");
const { sendMessage } = require("../../utils/sendMessage");

exports.storeLocation = async (req, res) => {
  // console.log(req.user.id);
  const user = await User.findOne({
    where: {
      id: req.user.id,
    },
  });
  console.log(user);
  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS locations(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,location VARCHAR(255),userId INT REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE)",
    {
      type: sequelize.QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    "INSERT INTO locations (location,userId) VALUES (?,?)",
    {
      type: sequelize.QueryTypes.INSERT,
      replacements: [req.body.location, req.user.id],
    }
  );

  const message = `${user.fullName} is in emergency & his  location is ${req.body.location}`;
  await sendMessage(message, `+977 ${user.parentNumber}`);
  res.render("error/pathError", {
    message: "Location has been sent to your parent's number",
    code: 201,
  });
};
