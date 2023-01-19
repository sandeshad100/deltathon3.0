const express = require("express");
const {
  createBloodRequest,
  getBloodRequests,
  deleteBloodRequest,
  getIndividualBloodRequest,
  renderBloodRequestForm,
} = require("../controllers/bloodRequest/bloodRequest");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const { restrictTo } = require("../utils/restrictTo");
const router = express.Router();

router.route("/new").get(renderBloodRequestForm);
router
  .route("/")
  .post(
    protectMiddleware,
    restrictTo("donor", "admin"),
    catchAsync(createBloodRequest)
  )
  .get(catchAsync(getBloodRequests));
router
  .route("/:id")
  .delete(catchAsync(deleteBloodRequest))
  .get(catchAsync(getIndividualBloodRequest));

module.exports = router;
