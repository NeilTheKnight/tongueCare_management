const express = require('express');
const Clinic = require('../models/Clinic');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { clinicSchema } = require('../validations/schemas');

const router = express.Router();

// Create a new clinic
router.post('/', [auth, roleAuth(['admin', 'agent']), validate(clinicSchema)], async (req, res) => {
  try {
    const clinic = new Clinic({
      ...req.body,
      user: req.user._id
    });
    await clinic.save();
    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ... rest of the file remains the same