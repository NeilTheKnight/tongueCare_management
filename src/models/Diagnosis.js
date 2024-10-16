const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  diagnosisData: { type: Object, required: true },
  tongueImage: { type: String, required: true },
  result: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);