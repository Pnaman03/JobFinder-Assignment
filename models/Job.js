const mongoose = require("mongoose");

const JobModel = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  post_date: {
    type: Date,
    default: Date.now,
  },
  tentative_date: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
  },
  offer: {
    type: Number,
    required: true,
  },
  selected: [
    {
      candidate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    },
  ],
  onHold: [
    {
      candidate_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    },
  ],
  employer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

module.exports = Job = mongoose.model("job", JobModel);
