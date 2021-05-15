const express = require("express");
var router = express.Router();

const auth = require("../middleware/auth");
const Job = require("../models/Job");
const User = require("../models/User");

// ---------------------------------------------- Get Routes -------------------------------------------------------->
// @desc     Get all Jobs Posted by employers
// @access   Private
router.get("/recievedjobs", auth, async function (req, res) {
  if (req.user && req.user.type === "Employee") {
    res.redirect("/logout");
  }

  // fetchig all jobs
  const jobs = await Job.find()
    .sort({ post_date: -1 })
    .populate({ path: "employer_id", populate: "company_id" });

  // fetching jobs accepted by candidate
  const accJobs = await User.findById(req.user.id, { acceptedJob: 1 }).populate(
    {
      path: "acceptedJob.job_id",
    }
  );
  // maping accepted job in hash for faster retrival for filter jobs to be shown
  const accjobMap = accJobs.acceptedJob.reduce(function (memo, item) {
    memo[item.job_id._id] = memo[item.job_id._id] || true;
    return memo;
  }, {});

  // fetching jobs rejected by candidate
  const rejJobs = await User.findById(req.user.id, { rejectedJob: 1 }).populate(
    {
      path: "rejectedJob.job_id",
    }
  );

  // maping rejected job in hash for faster retrival for filter jobs to be shown
  const rejJobMap = rejJobs.rejectedJob.reduce(function (memo, item) {
    memo[item.job_id._id] = memo[item.job_id._id] || true;
    return memo;
  }, {});

  // filter all jobs based on accepted/rejected list
  var result = jobs.filter((x) => !accjobMap[x._id]);
  result = result.filter((x) => !rejJobMap[x._id]);

  res.render("CanRiecvJob.ejs", { userData: result, name: req.user.name });
});

// @desc     Get all Jobs Accepted by a candidate
// @access   Private
router.get("/acceptedjobs", auth, async function (req, res) {
  if (req.user && req.user.type === "Employee") {
    res.redirect("/login");
  }
  const jobs = await User.findById(req.user.id, { acceptedJob: 1 }).populate({
    path: "acceptedJob.job_id",
    populate: { path: "employer_id", populate: "company_id" },
  });

  res.render("CanAccpJob.ejs", {
    userData: jobs.acceptedJob,
    name: req.user.name,
  });
});

// @desc     Get all Jobs Rejected by a candidate
// @access   Private
router.get("/rejectedjobs", auth, async function (req, res) {
  if (req.user && req.user.type === "Employee") {
    res.redirect("/auth/logout");
  }
  const jobs = await User.findById(req.user.id, { rejectedJob: 1 }).populate({
    path: "rejectedJob.job_id",
    populate: { path: "employer_id", populate: "company_id" },
  });

  res.render("CanRejectJob.ejs", {
    userData: jobs.rejectedJob,
    name: req.user.name,
  });
});

// ---------------------------------------------- Actions based on Accept/Reject/Undo etc -------------------------------------------------------->

// @desc     Pushing job into candidate's accepted list.
// @access   Private
router.get("/accept/:id", auth, async function (req, res) {
  var job = {
    job_id: req.params.id,
  };

  var update = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { acceptedJob: job } },
    { new: true }
  );

  var cand = {
    candidate_id: req.user.id,
  };
  var update1 = await Job.findByIdAndUpdate(
    req.params.id,
    { $push: { onHold: cand } },
    { new: true }
  );
  res.redirect("/cand/recievedjobs");
});

// @desc     Removing job from candidate's accepted list.
// @access   Private
router.get("/undoaccept/:id", auth, async function (req, res) {
  var job = {
    job_id: req.params.id,
  };

  var update = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { acceptedJob: job } },
    { multi: true }
  );

  var cand = {
    candidate_id: req.user.id,
  };
  var update1 = await Job.findByIdAndUpdate(
    req.params.id,
    { $pull: { onHold: cand } },
    { new: true }
  );

  res.redirect("/cand/acceptedjobs");
});

// @desc     Pushing job from candidate's Rejected list.
// @access   Private
router.get("/reject/:id", auth, async function (req, res) {
  var job = {
    job_id: req.params.id,
  };

  var update = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { rejectedJob: job } },
    { new: true }
  );

  res.redirect("/cand/recievedjobs");
});

// @desc     Removing job from candidate's rejected list.
// @access   Private
router.get("/undoreject/:id", auth, async function (req, res) {
  var job = {
    job_id: req.params.id,
  };

  var update = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { rejectedJob: job } },
    { multi: true }
  );

  res.redirect("/cand/rejectedjobs");
});

module.exports = router;
