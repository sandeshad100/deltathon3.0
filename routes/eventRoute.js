const express = require("express");
const {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
  renderCreateEventPage,
  renderUpdateEventForm,
  getIndividualEvent,
} = require("../controllers/event/eventController");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { storage, multer } = require("../utils/multerConfig");
const { restrictTo } = require("../utils/restrictTo");
// const { storage } = require("../cloudinary");
const upload = multer({ storage: storage });

// router.route("/new").get(renderCreateEventPage);
router.route("/update").get(renderUpdateEventForm);
router
  .route("/")
  .get(catchAsync(getEvents))
  .post(upload.single("image"), catchAsync(createEvent));
router
  .route("/:id")
  .get(catchAsync(getIndividualEvent))
  .patch(restrictTo("admin"), catchAsync(updateEvent))
  .delete(restrictTo("admin"), catchAsync(deleteEvent));

module.exports = router;
