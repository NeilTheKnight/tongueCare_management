const express = require('express');
const Diagnosis = require('../models/Diagnosis');
const Device = require('../models/Device');
const Clinic = require('../models/Clinic');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { diagnosisSchema, updateDiagnosisSchema } = require('../validations/schemas');

const router = express.Router();

// Create a new diagnosis
router.post('/', [auth, roleAuth(['doctor']), validate(diagnosisSchema)], async (req, res) => {
  try {
    const { patientId, deviceId, diagnosisData, tongueImage, result } = req.body;

    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const diagnosis = new Diagnosis({
      patientId,
      deviceId,
      diagnosisData,
      tongueImage,
      result,
      doctor: req.user._id,
      clinic: device.clinic
    });

    await diagnosis.save();
    res.status(201).json(diagnosis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all diagnoses
router.get('/', [auth, roleAuth(['admin', 'agent', 'clinic_admin', 'doctor'])], async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'clinic_admin') {
      const clinic = await Clinic.findOne({ user: req.user._id });
      query.clinic = clinic._id;
    } else if (req.user.role === 'agent') {
      const clinics = await Clinic.find({ agent: req.user._id });
      const clinicIds = clinics.map(clinic => clinic._id);
      query.clinic = { $in: clinicIds };
    }

    const diagnoses = await Diagnosis.find(query)
      .populate('deviceId')
      .populate('doctor', 'name')
      .populate('clinic', 'name');
    res.json(diagnoses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific diagnosis
router.get('/:id', [auth, roleAuth(['admin', 'agent', 'clinic_admin', 'doctor'])], async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('deviceId')
      .populate('doctor', 'name')
      .populate('clinic', 'name');

    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    // Check if the user has permission to view this diagnosis
    if (req.user.role === 'doctor' && !diagnosis.doctor.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to view this diagnosis' });
    }

    if (req.user.role === 'clinic_admin') {
      const clinic = await Clinic.findOne({ user: req.user._id });
      if (!diagnosis.clinic.equals(clinic._id)) {
        return res.status(403).json({ error: 'Not authorized to view this diagnosis' });
      }
    }

    res.json(diagnosis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a diagnosis
router.put('/:id', [auth, roleAuth(['doctor']), validate(updateDiagnosisSchema)], async (req, res) => {
  try {
    const { result } = req.body;
    const diagnosis = await Diagnosis.findById(req.params.id);

    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    if (!diagnosis.doctor.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to update this diagnosis' });
    }

    diagnosis.result = result;
    await diagnosis.save();
    res.json(diagnosis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a diagnosis
router.delete('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id);
    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }
    res.json({ message: 'Diagnosis deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;