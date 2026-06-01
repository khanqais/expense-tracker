const User = require("../models/User");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  const { password, email } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Enter the email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User does not exist" });
  }

  const IsPassword = await user.comparePassword(password);
  if (!IsPassword) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }

  const token = user.createJWT();
  res.json({ success: true, token, userId: user._id, user: { name: user.name, email: user.email, role: user.role } }); 
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const ExistUser = await User.findOne({ email });

    if (ExistUser) {
      return res.status(400).json({ success: false, message: "User Already Exists" });
    }

    const user = await User.create({ name, email, password });
    const token = user.createJWT();

    res.json({ success: true, token, userId: user._id, user: { name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" }); 
  }
};

const AdminLogin = async(req, res) => {
   try {
    const {email, password} = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
       const token = jwt.sign(
           { role: 'admin', email }, 
           process.env.JWT_SECRET || 'secret', 
           { expiresIn: '1d' }
       );
       res.json({success: true, token, user: { name: "Admin", email, role: 'admin' }});
    } else {
       res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
   } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" }); 
   }
}

const forget_password = async(req, res) => {
  const {email} = req.body;
  if (!email) {
    return res.status(400).send({message: "please provide the email"});
  }
  const checkemail = await User.findOne({email});
  if (!checkemail) {
     return res.status(404).json({success: false, message: "Not found"});
  }
  const token = jwt.sign({email}, process.env.JWT_SECRET || 'secret', {expiresIn: "1h"});
  
  try {
      const transporter = nodemailer.createTransport({
          service: "gmail",
          secure: true,
          auth: {
              user: process.env.MY_EMAIL,
              pass: process.env.MY_PASSWORD,
          },
      });
      const receiver = {
          from: process.env.MY_EMAIL,
          to: email,
          subject: "Password Reset Request",
          text: `Click on this link to reset your password ${process.env.CLIENT_URL}/reset-password/${token}`
      };
      await transporter.sendMail(receiver);
      res.status(200).json({success: true, message: "Link sent to Gmail"});
  } catch (error) {
      console.log(error);
      res.status(500).json({success: false, message: "Failed to send email"});
  }
}

const reset_password = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const email = decoded.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    user.password = password; 
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Reset Password Error:", error);
    res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = {
    login, register, AdminLogin, forget_password, reset_password
};
