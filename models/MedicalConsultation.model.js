const mongoose = require("mongoose");

const MedicalConsultationSchema = mongoose.Schema({
    pacient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date_of_appointment: { type: Date, required: true },
    // time_of_appointment: { type: Date, required: true },
});

module.exports = mongoose.model("MedicalConsultation", MedicalConsultationSchema);