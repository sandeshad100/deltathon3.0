const express = require("express");
const { storeLocation } = require("../controllers/location/locationController");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const router = express.Router();

router.route("/").post(protectMiddleware, catchAsync(storeLocation));

module.exports = router;
