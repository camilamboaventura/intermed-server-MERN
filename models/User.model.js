const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: { type: String, required: true },
  address: {
    street: { type: String, required: true, trim: true },
    neighbourhood: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postCode: { type: String, required: true, trim: true },
    stateOrProvince: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  role: {
    type: String,
    enum: ["ADMIN", "USER", "DOCTOR"],
    required: true,
    default: "USER",
  },
  date_of_birth: { type: Date, required: true },
  gender: { type: String, required: true },
  user_pic: {
    type: String,
    default: "https://voxnews.com.br/wp-content/uploads/2017/04/unnamed.png",
  },
  social_security_number: { type: Number, required: true },
  records: [{ type: mongoose.Schema.Types.ObjectId, ref: "PatientRecord" }],
  // medicalConsultation: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalConsultation" }],
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
