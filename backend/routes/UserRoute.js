const express = require('express');
const router = express.Router();
const passport = require('passport');
const { login, register, AdminLogin, forget_password, reset_password } = require('../controllers/UserControl');
const { authUser } = require('../middleware/auth');

router.post("/login", login);
router.post("/register", register);
router.post("/admin", AdminLogin);
router.post("/forget", forget_password);
router.post("/reset-password/:token", reset_password);


router.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account"
}));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {

    const token = req.user.createJWT();

    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.redirect(`${process.env.CLIENT_URL}?token=${token}&userId=${req.user._id}&name=${encodeURIComponent(req.user.name)}`);
  }
);

router.get("/me", authUser, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.body.userId).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching user data" });
  }
});

module.exports = router;
