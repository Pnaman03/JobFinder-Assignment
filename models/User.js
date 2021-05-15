const mongoose = require("mongoose");

const UserModel = new mongoose.Schema({
  // Common fields for both Employer and Candidate
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  regis_date: {
    type: Date,
    default: Date.now,
  },

  location: {
    type: String,
    required: true,
  },

  // Type of User : Employer or Candidate
  type: {
    type: String,
    required: true,
  },

  // For Employer... It will be null for Candidate
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
  },

  // For Candidate to keep track of Application accepted / rejected. For Employer it will be null
  acceptedJob: [
    {
      job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // For Candidate to keep track of Application accepted / rejected. For Employer it will be null
  rejectedJob: [
    {
      job_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "job",
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = User = mongoose.model("user", UserModel);
