const jwt = require("jsonwebtoken");
const { promisify } = require("util");
// const User = require('../model/userModel')
const db = require("../model/index");
const User = db.users;

//SIGN IN JWT TOKEN
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
const createToken = (user, statusCode, res) => {
  // console.log(user.id);
  const token = signInToken(user.id);

  //send cookie in response
  res.cookie("jwtToken", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "sucess",
    token,
    data: {
      user,
    },
  });
};

exports.protectMiddleware = async (req, res, next) => {
  const authorizatonHeader = req.headers.authorization;
  const { jwtToken } = req.cookies;

  let token;
  if (authorizatonHeader && authorizatonHeader.startsWith("Bearer")) {
    token = authorizatonHeader.split(" ")[1];
  } else {
    token = jwtToken;
  }

  if (!token) {
    return res.render("error/pathError", {
      message: "You must be logged In!!",
      code: 401,
    });
  }

  //using promisify , we don't need to handle the callback of the jwt
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const loggedInUser = await User.findOne({ where: { id: decoded.id } });
  if (!loggedInUser) {
    return res.render("error/pathError", {
      message: "You are not user belonging to this token",
      code: 400,
    });
  }
  req.user = loggedInUser;
  next();
};
