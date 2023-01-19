const express = require("express");
const { renderSelectPage } = require("../controllers/select/selectController");
const router = express.Router();

router.route("/").get(renderSelectPage);
module.exports = router;
