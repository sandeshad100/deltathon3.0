const db = require("../../model/index");
const User = db.users;
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { createHmac } = require("crypto");
const sendEmail = require("../../utils/email");
const { Op } = require("sequelize");
const AppError = require("./../../utils/appError");
const { sequelize } = require("../../model/index");
const schedule = require("node-schedule");
const sendTextEmail = require("../../utils/sendTextMessage");

///SIGN IN JWT TOKEN
const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// COOKIE OPTION FOR COOKIE
const cookieOptions = {
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: true,
};

//CREATING TOKEN AS WELL SENDING THE TOKEN IN COOKIE
const createToken = (user, statusCode, res, req) => {
  // console.log(user.id);
  const token = signInToken(user.id);

  //send cookie in response
  res.cookie("jwtToken", token, cookieOptions);
  user.password = undefined;
  req.flash("success", "Logged in successfully");
  res.redirect("/select");
};
exports.renderRegister = async (req, res) => {
  const provinces = await sequelize.query(" SELECT * FROM provinces ", {
    type: sequelize.QueryTypes.SELECT,
  });

  res.render("auth/register", { provinces });
};
exports.createUser = async (req, res, next) => {
  const {
    fullName,
    bloodGroup,
    province,
    district,
    localLevel,
    email,
    dateOfBirth,
    phone,
    gender,
    password,
    passwordConfirm,
    agree,
    parentNumber,
  } = req.body;
  const role = req.body.role || "donor";
  const availiabilityStatus = "available";

  if (agree !== "on")
    return res.render("error/pathError", {
      message: "Agree terms and policy to continue",
      code: 400,
    });
  if (
    !fullName ||
    !bloodGroup ||
    !email ||
    !dateOfBirth ||
    !phone ||
    !password ||
    !passwordConfirm
  ) {
    return res.render("error/pathError", {
      message: "Fill all the fields",
      code: 400,
    });
  }
  if (password.toLowerCase() !== passwordConfirm.toLowerCase()) {
    return res.render("error/pathError", {
      message: "password and passwordConfirm doesn't match",
      code: 400,
    });
  }
  const phoneExist = await User.findOne({
    where: { phone: phone },
  });

  const emailExist = await User.findOne({
    where: { email: email },
  });

  if (phoneExist && emailExist) {
    return res.render("error/pathError", {
      message: "User already exists",
      code: 400,
    });
  }

  const user = await User.create({
    fullName,
    bloodGroup,
    province,
    district,
    localLevel,
    email,
    dateOfBirth,
    phone,
    password,
    role,
    availiabilityStatus,
    parentNumber,
  });

  if (user) {
    req.flash("success", "User created successfully");
    return res.redirect("/");
  }
};

exports.renderLogin = (req, res) => {
  res.render("auth/login");
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.render("error/pathError", {
      message: "Please provide email and password",
      code: 400,
    });
  const user = await User.findOne({
    where: { email: email },
  });
  if (!user || !(await user.comparePassword(password))) {
    return res.render("error/pathError", {
      message: "Incorrect email or password",
      code: 400,
    });
  }

  createToken(user, 200, res, req);
};

exports.logOut = async (req, res) => {
  res.clearCookie("jwtToken");
  res.locals.hospitalId && res.clearCookie("hospitalId");
  req.flash("success", "Logged out successfully");
  res.redirect("/");
};

exports.getMe = async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.render("error/pathError", {
      message: "User not found",
      code: 400,
    });
  }

  try {
    var history = await sequelize.query(
      `SELECT * FROM history WHERE userId = ${user.id}`,
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    history = [];
  }
  try {
    var totalAmount = await sequelize.query(
      `SELECT SUM(amount) FROM history WHERE userId = ${user.id}`,
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch (error) {
    totalAmount = [];
    console.log(error);
  }

  res.status(200).render("auth/profile", {
    user,
    history,
    totalAmount: (totalAmount.length > 0 && totalAmount[0]["SUM(amount)"]) || 0,
  });
};

exports.renderAddToHistory = async (req, res, next) => {
  res.render("auth/addToHistory");
};

exports.createAddToHistory = async (req, res, next) => {
  const { name, date, amount, caseDetail } = req.body;
  if (req.user.availiabilityStatus !== "available") {
    return res.render("error/pathError", {
      message: "You can only donate once in a 3 months",
      code: 400,
    });
  }
  if (!name || !date || !amount || !caseDetail)
    return res.render("error/pathError", {
      message: "Please provide all the fields",
      code: 400,
    });

  await sequelize.query(
    " CREATE TABLE IF NOT EXISTS history(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,name VARCHAR(255),date DATE,amount INT,caseDetail VARCHAR(255))",
    {
      type: sequelize.QueryTypes.CREATE,
    }
  );
  await sequelize.query(
    " INSERT INTO history(userId,name,date,amount,caseDetail) VALUES(?,?,?,?,?)",
    {
      replacements: [req.user.id, name, date, amount, caseDetail],
      type: sequelize.QueryTypes.INSERT,
    }
  );
  const user = await User.findByPk(req.user.id);
  user.availiabilityStatus = "Not available";
  await user.save();

  await sequelize.query(
    "CREATE TABLE IF NOT EXISTS roleExpiration(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,expirationDate DATE )",
    {
      type: sequelize.QueryTypes.CREATE,
    }
  );
  const lastDonation = await sequelize.query(
    " SELECT date FROM history WHERE userId = ? ORDER BY id DESC LIMIT 1",
    {
      replacements: [user.id],
      type: sequelize.QueryTypes.SELECT,
    }
  );
  const lastDonationDate = lastDonation[0].date;
  var expiration_date = new Date(lastDonationDate);
  expiration_date.setDate(expiration_date.getDate() + 30);
  expiration_date = expiration_date.toISOString().slice(0, 10);

  await sequelize.query(
    " INSERT INTO roleExpiration(userId,expirationDate) VALUES(?,?)",
    {
      replacements: [req.user.id, expiration_date],
      type: sequelize.QueryTypes.INSERT,
    }
  );

  const job = schedule.scheduleJob("0 0 * * * *", async function () {
    try {
      const expiredRoleExpirations = await sequelize.query(
        `SELECT * FROM roleExpiration
        WHERE expirationDate < CURRENT_DATE`,
        { type: sequelize.QueryTypes.SELECT }
      );
      for (const expiredRoleExpiration of expiredRoleExpirations) {
        await sequelize.query(
          `UPDATE users SET availiabilityStatus = 'available'
            WHERE id = ${expiredRoleExpiration.userId}`,
          { type: sequelize.QueryTypes.UPDATE }
        );
      }
      console.log(`${expiredRoleExpirations.length} expired roles updated`);
    } catch (error) {
      console.error(error);
    }
  });
  res.redirect("/profile");
};

exports.renderAdminDashboard = async (req, res, next) => {
  const users = await User.findAll();
  const user = await User.findByPk(req.user.id);
  try {
    var events = await sequelize.query(`SELECT * FROM events`, {
      type: sequelize.QueryTypes.SELECT,
    });
    var bloodBanks = await sequelize.query(`SELECT * FROM bloodBank`, {
      type: sequelize.QueryTypes.SELECT,
    });
    var contactMessages = await sequelize.query(
      `SELECT * FROM contactMessage`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
  } catch (error) {
    events = [];
    bloodBanks = [];
    contactMessages = [];
    // res.render("error/pathError", { message: error.message, code: 400 });
  }

  res.render("auth/adminDashboard", {
    user,
    users,
    events,
    bloodBanks,
    contactMessages,
  });
};

exports.renderForgotPassword = async (req, res, next) => {
  res.render("auth/forgotPassword");
};

exports.forgotPassword = async (req, res, next) => {
  //check if user emai exists in the database
  const { email } = req.body;
  const user = await User.findOne({ where: { email: email } });
  if (!user)
    return res.render("error/pathError", {
      message: "Email not found",
      code: 404,
    });

  // createResetToken method is coming from usermodel file
  const otp = await user.createResetToken();

  const secret = process.env.SECRET;
  user.passwordResetToken = createHmac("sha256", secret)
    .update(`${otp}`)
    .digest("hex");
  user.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  await user.save();

  const message = `Forgot your password ? Enter the otp  \n
  ${otp}. \n If you don't forget your password , please ignore this email! `;

  try {
    await sendTextEmail({
      email: user.email,
      subject: "Your password reset otp (only valids for 10 minutes)",
      message,
    });
    res.redirect("/resetPassword");
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save();

    return res.render("error/pathError", { message: err.message, code: 500 });
  }
};
exports.renderResetPassword = async (req, res, next) => {
  res.render("auth/resetPassword");
};

exports.resetPassword = async (req, res, next) => {
  const { otp, password } = req.body;
  if (!otp || !password) {
    return res.render("error/pathError", { message: "Invalid otp", code: 400 });
  }
  const secret = process.env.SECRET;

  const hashedOtp = createHmac("sha256", secret).update(`${otp}`).digest("hex");

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedOtp,

      passwordResetTokenExpiresIn: {
        [Op.gt]: Date.now(),
      },
    },
  });
  if (!user) {
    return res.render("error/pathError", {
      message: "Invalid otp or expired",
      code: 400,
    });
  }
  user.password = password;
  user.passwordResetTokenExpiresIn = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  // sign in jwt token
  createToken(user, 200, res, req);
};
