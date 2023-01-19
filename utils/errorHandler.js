const AppError = require("./appError.js");
// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path} : ${err.value}`;
//   return new AppError(message, 400);
// };

const handleDuplicateFieldErrorDB = (err) => {
  console.log(err);
  const value = err.errors[0].value;
  const message = `The value ${value} already exists , please use another value `;
  return new AppError(message, 400);
};
const handleDuplicateTableErrorDB = (err) => {
  const value = err.parent.sqlMessage;
  // const message = `The value ${value} already exists , please use another value `;
  return new AppError(value, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data . ${errors.join(". ")}`;

  //   console.log(message);
  return new AppError(message, 400);
};
const handleJsonWebTokenError = (err) => new AppError("Invalid token", 401);

const handleTokenExpiredError = () =>
  new AppError("Token Expired.Please login Again.", 401);

function sendErrorProd(err, res) {
  console.log(err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // console.error("ERROR ", err.parent.errno);
    // const errors = Object.values(err.errors).map((el) => el.message);
    // const message = `Invalid input data . ${errors.join(". ")}`;

    res.status(500).json({
      status: "error",

      message: "something went wrong",

      // err,
    });
  }
}

module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  //   if (err.name === "CastError") err = handleCastErrorDB(err);
  // if (err.parent.code === "ER_TABLE_EXISTS_ERROR")
  //   err = handleDuplicateTableErrorDB(err);
  // if (err.parent.code === "ER_DUP_ENTRY")
  //   err = handleDuplicateFieldErrorDB(err);

  if (err.name === "JsonWebTokenError") err = handleJsonWebTokenError(err);

  if (err.name === "TokenExpiredError") err = handleTokenExpiredError();
  if (err.name === "SequelizeValidationError")
    err = handleValidationErrorDB(err);

  sendErrorProd(err, res);
};
