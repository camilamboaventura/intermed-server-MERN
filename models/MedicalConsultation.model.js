const mongoose = require("mongoose");

const MedicalConsultationSchema = mongoose.Schema({
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date_of_appointment: { type: Date, required: true },
    time_of_appointment: { type: String, required: true },
});

module.exports = mongoose.model("MedicalConsultation", MedicalConsultationSchema);