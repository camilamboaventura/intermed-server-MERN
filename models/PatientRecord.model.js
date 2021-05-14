const mongoose = require("mongoose");

const PatientRecordSchema = mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date_of_visit: { type: Date, default: Date.now },
  allergy: [{ type: String, required: true, trim: true }],
  chief_complaint: { type: String, required: true, trim: true },
  history_illness: { type: String, required: true, maxlength: 500, trim: true },
  medications: [{ type: String, trim: true }],
  test_results: { type: String },
});

module.exports = mongoose.model("PatientRecord", PatientRecordSchema);
