const express = require("express");
var router = express.Router();

const auth = require("../middleware/auth");
const Job = require("../models/Job");

// @desc     Get Jobs Posted by employer
// @access   Private
router.get("/jobposts", auth, async function (req, res) {
  if (req.user && req.user.type === "Candidate") {
    res.redirect("/logout");
  }

  const jobs = await Job.find({ employer_id: req.user.id })
    .sort({ post_date: -1 })
    .populate({ path: "employer_id", populate: "company_id" });

  res.render("EmpJobPosts.ejs", { userData: jobs, name: req.user.name });
});

module.exports = router;
