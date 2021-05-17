const mongoose = require("mongoose");

const MedicalConsultationSchema = mongoose.Schema({
    pacient_id: {},
    doctor_id: {},
    date_of_appointment: {},



  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date_of_visit: { type: Date, default: Date.now },
  allergy: [{ type: String, required: true, trim: true }],
  chief_complaint: { type: String, required: true, trim: true },
  history_illness: { type: String, required: true, maxlength: 500, trim: true },
  medications: [{ type: String, trim: true }],
  test_results: { type: String },
});

module.exports = mongoose.model("MedicalConsultation", MedicalConsultationSchema);