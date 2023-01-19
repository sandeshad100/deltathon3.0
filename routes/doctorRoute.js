const express = require("express");
const { createDoctor } = require("../controllers/consultDoctor/consultDoctor");
const router = express.Router();

router.route("/").post(createDoctor);

module.exports = router;
