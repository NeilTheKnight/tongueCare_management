const express = require('express');
const Maintenance = require('../models/Maintenance');
const Device = require('../models/Device');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { maintenanceSchema } = require('../validations/schemas');

const router = express.Router();

// Create a new maintenance record
router.post('/', [auth, roleAuth(['admin', 'clinic_admin']), validate(maintenanceSchema)], async (req, res) => {
  try {
    const { deviceId, maintenanceType, description, nextMaintenanceDate } = req.body;

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const maintenance = new Maintenance({
      device: deviceId,
      maintenanceType,
      description,
      performedBy: req.user._id,
      nextMaintenanceDate
    });

    await maintenance.save();

    // Update device status and last maintenance date
    device.status = 'active';
    device.lastMaintenance = new Date();
    await device.save();

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get maintenance records for a device
router.get('/device/:deviceId', [auth, roleAuth(['admin', 'clinic_admin'])], async (req, res) => {
  try {
    const maintenanceRecords = await Maintenance.find({ device: req.params.deviceId })
      .populate('performedBy', 'name')
      .sort({ performedAt: -1 });

    res.json(maintenanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all maintenance records (admin only)
router.get('/', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const maintenanceRecords = await Maintenance.find()
      .populate('device', 'deviceId')
      .populate('performedBy', 'name')
      .sort({ performedAt: -1 });

    res.json(maintenanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;