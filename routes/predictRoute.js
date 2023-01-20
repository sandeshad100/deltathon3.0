const express = require("express");
const { getPredict } = require("../controllers/predict/predictController");
const router = express.Router();

router.route("/").get(getPredict);

module.exports = router;
