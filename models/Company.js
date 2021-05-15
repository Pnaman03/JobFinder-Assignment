const mongoose = require("mongoose");

const CompanyModel = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  company_field: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

module.exports = Company = mongoose.model("company", CompanyModel);
