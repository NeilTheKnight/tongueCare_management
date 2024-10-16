const express = require('express');
const Device = require('../models/Device');
const Clinic = require('../models/Clinic');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { deviceSchema, updateDeviceSchema } = require('../validations/schemas');

const router = express.Router();

// Create a new device
router.post('/', [auth, roleAuth(['admin', 'clinic_admin']), validate(deviceSchema)], async (req, res) => {
  try {
    const { deviceId, deviceType, firmwareVersion, clinicId } = req.body;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const device = new Device({
      deviceId,
      deviceType,
      firmwareVersion,
      clinic: clinicId
    });

    await device.save();
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all devices
router.get('/', [auth, roleAuth(['admin', 'agent', 'clinic_admin'])], async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'clinic_admin') {
      const clinic = await Clinic.findOne({ user: req.user._id });
      query.clinic = clinic._id;
    } else if (req.user.role === 'agent') {
      const clinics = await Clinic.find({ agent: req.user._id });
      const clinicIds = clinics.map(clinic => clinic._id);
      query.clinic = { $in: clinicIds };
    }

    const devices = await Device.find(query).populate('clinic', 'name');
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a device
router.put('/:id', [auth, roleAuth(['admin', 'clinic_admin']), validate(updateDeviceSchema)], async (req, res) => {
  try {
    const { firmwareVersion, status } = req.body;
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    if (req.user.role === 'clinic_admin') {
      const clinic = await Clinic.findOne({ user: req.user._id });
      if (!device.clinic.equals(clinic._id)) {
        return res.status(403).json({ error: 'Not authorized to update this device' });
      }
    }

    device.firmwareVersion = firmwareVersion || device.firmwareVersion;
    device.status = status || device.status;
    if (status === 'maintenance') {
      device.lastMaintenance = new Date();
    }

    await device.save();
    res.json(device);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a device
router.delete('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;