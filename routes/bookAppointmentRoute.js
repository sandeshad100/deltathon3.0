const express = require("express");
const {
  createBookAppointment,
  renderBookAppointmentForm,
} = require("../controllers/bookAppointment/bookAppointmentController");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();

router.route("/new").get(renderBookAppointmentForm);
router.route("/").post(catchAsync(createBookAppointment));

module.exports = router;
