const express = require("express");
const {
  createDonor,
  getDonors,
  deleteDonor,
  renderCreateDonorForm,
} = require("../controllers/donor/donorController");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { restrictTo } = require("../utils/restrictTo");

router.route("/new").get(renderCreateDonorForm);
router.route("/").get(catchAsync(getDonors));

router.route("/:id").delete(catchAsync(deleteDonor));

module.exports = router;
