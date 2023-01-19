const express = require("express");
const {
  postContactMessage,
  getContactMessage,
} = require("../controllers/contactController/contactController");
const catchAsync = require("../utils/catchAsync");
const { restrictTo } = require("../utils/restrictTo");
const router = express.Router();

router
  .route("/")
  .post(catchAsync(postContactMessage))
  .get(restrictTo("admin"), catchAsync(getContactMessage));

module.exports = router;
