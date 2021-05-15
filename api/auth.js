const express = require("express");
var router = express.Router();

// dependencies
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");

const User = require("../models/User");
const Company = require("../models/Company");

// JWT token genration (used in below methods)
const generateToken = (payload) => {
  return jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 360000 });
};

// ---------------------------------------------- Login -------------------------------------------------------->
// @desc     Get Login Page
// @access   Public
router.get("/login", function (req, res) {
  res.render("login.ejs", { error: "" });
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login.ejs", { error: errors.errors[0].msg });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.render("login.ejs", { error: "Invalid Credetials !" });
      }
      // msg: 'Invalid Credentials'

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.render("login.ejs", { error: "Invalid Credetials !" });
      }

      const payload = {
        user: {
          id: user.id,
          type: user.type,
          name: user.full_name,
        },
      };

      var token = generateToken(payload);
      res.cookie("token", token);
      if (user.type === "Employee") {
        res.redirect("/emp/jobposts");
      } else {
        res.redirect("/cand/recievedjobs");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// ---------------------------------------------- Logout -------------------------------------------------------->
// @desc     Logout current user
// @access   Public
router.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
});

// ---------------------------------------------- Register -------------------------------------------------------->
// @desc     Get Register Page
// @access   Public
router.get("/register", function (req, res) {
  var err = "";
  if (req.cookies.error) {
    err = req.cookies.error;
    res.clearCookie("error");
  }
  res.render("register.ejs", { error: err });
});

// ---------------------------------------------- Register Candidate -------------------------------------------------------->

// @desc     Register Candidate
// @access   Public
router.post(
  "/register/cand",
  [
    // validating request Body
    check("full_name", "Name is required").not().isEmpty(),
    check("location", "Location is required").not().isEmpty(),
    check("email_address", "Please include a valid email").isEmail(),
    check("phone_number", "Please enter 10 digits Mobile number").isLength({
      min: 10,
      max: 10,
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.cookie("error", errors.errors[0].msg);
      return res.redirect("/auth/register");
    }

    const { full_name, email_address, phone_number, location, password } =
      req.body;

    try {
      if (req.body.confirm_password !== req.body.password) {
        res.cookie("error", "Confirm Password Does not match with Password");
        return res.redirect("/auth/register");
      }

      let user = await User.findOne({ email: email_address });
      let user1 = await User.findOne({ phone_number });

      if (user || user1) {
        res.cookie("error", "User exists with given Mobile number or enail");
        return res.redirect("/auth/register");
      }

      user = new User({
        full_name,
        email: email_address,
        location,
        phone_number,
        password,
        type: "Candidate",
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
          type: user.type,
          name: user.full_name,
        },
      };

      var token = generateToken(payload);
      res.cookie("token", token);
      res.redirect("/cand/recievedjobs");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// ---------------------------------------------- Register Employer -------------------------------------------------------->
// @desc     Register Employer
// @access   Public
router.post(
  "/register/emp",
  [
    // validating request Body
    check("full_name", "Name is required").not().isEmpty(),
    check("company_name", "Company Name is required").not().isEmpty(),
    check("company_field", "Name is required").not().isEmpty(),
    check("location", "Location is required").not().isEmpty(),
    check("email_address", "Please include a valid email").isEmail(),
    check("phone_number", "Please enter 10 digits Mobile number").isLength({
      min: 10,
      max: 10,
    }),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.cookie("error", errors.errors[0].msg);
      return res.redirect("/auth/register");
    }

    const {
      full_name,
      email_address,
      phone_number,
      location,
      password,
      company_name,
      company_field,
    } = req.body;

    try {
      if (req.body.confirm_password !== req.body.password) {
        res.cookie("error", "Confirm Password Does not match with Password");
        return res.redirect("/auth/register");
      }

      let user = await User.findOne({ email: email_address });
      let user1 = await User.findOne({ phone_number });

      if (user || user1) {
        res.cookie("error", "User exists with given Mobile number or enail");
        return res.redirect("/auth/register");
      }

      var company = new Company({
        company_name,
        company_field,
        location,
      });
      company = await company.save();

      user = new User({
        full_name,
        email: email_address,
        location,
        phone_number,
        password,
        type: "Employee",
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.company_id = company._id;
      await user.save();

      const payload = {
        user: {
          id: user.id,
          type: user.type,
          name: user.full_name,
        },
      };

      var token = generateToken(payload);
      res.cookie("token", token);
      res.redirect("/emp/jobposts");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
module.exports = router;
