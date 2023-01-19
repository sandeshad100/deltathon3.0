const db = require("../../model/index");
const sequelize = db.sequelize;
const User = db.users;
const AppError = require("../../utils/appError");

const { QueryTypes, DataTypes } = require("sequelize");

exports.renderCreateDonorForm = async (req, res, next) => {
  res.render("donor/createForm");
};

exports.createDonor = async (req, res, next) => {
  const {
    fullName,
    bloodGroup,
    province,
    district,
    localLevel,
    email,
    dob,
    phone,
    gender,
    password,
  } = req.body;
  const { id } = req.user;
  const user = await User.findByPk(id);
  setTimeout(async () => {
    user.availiabilityStatus = "yes";
    user.donatedDate = null;
    await user.save();
  }, 30 * 24 * 60 * 60 * 1000);
  const availiabilityStatus = user.availiabilityStatus;
  if (!user || !(await user.comparePassword(password))) {
    req.flash("error", "Invalid password ");
    return res.redirect("/donor");
  }
  if (availiabilityStatus !== "yes") {
    req.flash("error", "You cannot donate for next 3 months");
    return res.redirect("/");
  }
  try {
    await sequelize.query(
      "CREATE TABLE IF NOT EXISTS donor (id NOT NULL PRIMARY KEY AUTO_INCREMENT,fullName VARCHAR(255),bloodGroup VARCHAR(255),province VARCHAR(255),district VARCHAR(255),localLevel VARCHAR(255),email VARCHAR(255),dob VARCHAR(255),phone VARCHAR(255),gender VARCHAR(255),createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)",
      {
        type: QueryTypes.CREATE,
      }
    );
    await sequelize.query(
      "INSERT INTO donor(fullName,bloodGroup,province,district,localLevel,email,dob,phone,gender) VALUES(?,?,?,?,?,?,?,?,?) ",
      {
        type: QueryTypes.INSERT,
        replacements: [
          fullName,
          bloodGroup,
          province,
          district,
          localLevel,
          email,
          dob,
          phone,
          gender,
        ],
      }
    );
    user.role = "donor";
    user.donatedDate = new Date();
    user.availiabilityStatus = "no";
    await user.save();
    req.flash("success", "You are donor now");
    res.redirect("/");
  } catch (error) {
    req.flash("error", "Something went wrong");
    res.redirect("/donor");
  }
};

exports.getDonors = async (req, res, next) => {
  const bloodGroup = req.query.bloodGroup;
  const district = req.query.district;
  const localLevel = req.query.localLevel;

  let users;
  if (!bloodGroup && !district && !localLevel) {
    // if no query parameters are provided, retrieve all users
    try {
      users = await User.findAll();
    } catch (error) {
      users = [];
    }
  } else if (!bloodGroup && !district) {
    // if only the localLevel parameter is provided, filter by localLevel
    users = await User.findAll({ where: { localLevel: localLevel } });
  } else if (!bloodGroup && !localLevel) {
    // if only the district parameter is provided, filter by district
    users = await User.findAll({ where: { district: district } });
  } else if (!district && !localLevel) {
    // if only the bloodGroup parameter is provided, filter by bloodGroup
    users = await User.findAll({ where: { bloodGroup: bloodGroup } });
  } else if (!bloodGroup) {
    // if district and localLevel parameters are provided, filter by both
    users = await User.findAll({
      where: { district: district, localLevel: localLevel },
    });
  } else if (!district) {
    // if bloodGroup and localLevel parameters are provided, filter by both
    users = await User.findAll({
      where: { bloodGroup: bloodGroup, localLevel: localLevel },
    });
  } else if (!localLevel) {
    // if bloodGroup and district parameters are provided, filter by both
    users = await User.findAll({
      where: { bloodGroup: bloodGroup, district: district },
    });
  } else {
    // if all parameters are provided, filter by all
    users = await User.findAll({
      where: {
        bloodGroup: bloodGroup,
        district: district,
        localLevel: localLevel,
      },
    });
  }
  const districts = await sequelize.query(" SELECT name FROM districts", {
    type: QueryTypes.SELECT,
  });
  console.log(districts);
  res.render("donors/index", { users, districts });
};

exports.getDonor = async (req, res, next) => {
  const donor = await sequelize.query("SELECT * FROM donor WHERE id=?", {
    type: QueryTypes.SELECT,
    replacements: [req.params.id],
  });
  if (!donor) {
    req.flash("error", "Not found for that id");
    res.redirect("/");
  }
  res.render("donor/showIndividual", { donor });
};
exports.deleteDonor = async (req, res, next) => {
  await sequelize.query("DELETE FROM donor WHERE id=?", {
    type: QueryTypes.DELETE,
    replacements: [req.params.id],
  });
  req.flash("success", "Deleted the donation portal sucessfully");
  res.redirect("/");
};
