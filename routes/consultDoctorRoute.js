const express = require("express");
const {
  renderConsultDoctorPage,
  createDoctor,
  getDoctors,
  messageToDoctor,
  doctorAi,
} = require("../controllers/consultDoctor/consultDoctor");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const { restrictTo } = require("../utils/restrictTo");
const { route } = require("./authRoute");
const router = express.Router();

router
  .route("/")
  .get(protectMiddleware, getDoctors)
  .post(protectMiddleware, restrictTo("admin"), createDoctor);
router.route("/sendMessage").post(catchAsync(messageToDoctor));
router.route("/doctorAi").post(doctorAi);

module.exports = router;
