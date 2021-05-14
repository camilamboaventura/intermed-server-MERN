const mongoose = require("mongoose");

const PatientRecordSchema = mongoose.Schema({
  _id:{},
  drug_allergy: { type: String, required: true},
  food_pairing: [{ type: String, trim: true }],
  contributed_by: String,
  cost: { type: Number, required: true },
  price: { type: Number, required: true },
  qtt_in_stock: { type: Number, required: true },
  volume: { type: Number, required: true },
  expire_date: { type: Date, required: true },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

module.exports = mongoose.model("PatientRecord", PatientRecordSchema);