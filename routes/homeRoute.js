const express = require("express");

const { renderHomePage } = require("../controllers/home/homeController");
const catchAsync = require("../utils/catchAsync");
const router = express.Router();

router.route("/").get(renderHomePage);

module.exports = router;
