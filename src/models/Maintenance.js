const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  maintenanceType: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedAt: { type: Date, default: Date.now },
  nextMaintenanceDate: { type: Date, required: true },
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);