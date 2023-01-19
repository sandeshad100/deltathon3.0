const express = require("express");
const {
  createUser,
  renderRegister,
  loginUser,
  renderLogin,
  logOut,
  getMe,
  renderAddToHistory,
  createAddToHistory,
  renderAdminDashboard,
  renderForgotPassword,
  forgotPassword,
  renderResetPassword,
  resetPassword,
} = require("../controllers/auth/authController");
const { renderHomePage } = require("../controllers/home/homeController");
const catchAsync = require("../utils/catchAsync");
const { protectMiddleware } = require("../utils/isAuthenticated");
const { restrictTo } = require("../utils/restrictTo");
const router = express.Router();

router.route("/register").post(catchAsync(createUser)).get(renderRegister);
router.route("/").get(renderLogin);
router.route("/login").post(catchAsync(loginUser))
router.route("/logOut").get(catchAsync(logOut));
router.route("/profile").get(protectMiddleware, catchAsync(getMe));
router
  .route("/addToHistory")
  .get(renderAddToHistory)
  .post(protectMiddleware, catchAsync(createAddToHistory));
router
  .route("/admin/dashboard")
  .get(protectMiddleware, restrictTo("admin"), renderAdminDashboard);

router
  .route("/forgotPassword")
  .get(renderForgotPassword)
  .post(catchAsync(forgotPassword));

router
  .route("/resetPassword")
  .get(renderResetPassword)
  .post(catchAsync(resetPassword));

module.exports = router;
