const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  deviceType: { type: String, required: true },
  firmwareVersion: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  lastMaintenance: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Device', deviceSchema);