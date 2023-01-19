const express = require("express");
const {
  renderAmbulanceList,
  createAmbulance,
  renderCreateAmbulanceForm,
  deleteAmbulance,
  renderAmbulanceDetail,
} = require("../controllers/ambulance/ambulanceController");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();

router.route("/new").get(renderCreateAmbulanceForm);
router
  .route("/")
  .get(catchAsync(renderAmbulanceList))
  .post(catchAsync(createAmbulance));
router
  .route("/:id")
  .get(catchAsync(deleteAmbulance))
  .get(renderAmbulanceDetail);

module.exports = router;
