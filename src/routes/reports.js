const express = require('express');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Diagnosis = require('../models/Diagnosis');
const Device = require('../models/Device');
const Clinic = require('../models/Clinic');
const Agent = require('../models/Agent');

const router = express.Router();

// ... (previous routes remain unchanged)

// Generate yearly report
router.get('/yearly', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const diagnoses = await Diagnosis.find({
      createdAt: { $gte: startDate, $lte: endDate }
    })
      .populate('deviceId')
      .populate('clinic', 'name')
      .populate('doctor', 'name');

    const report = {
      totalDiagnoses: diagnoses.length,
      diagnosesByMonth: {},
      diagnosesByClinic: {},
      diagnosesByDoctor: {},
      topDevices: {}
    };

    diagnoses.forEach(diagnosis => {
      const month = diagnosis.createdAt.getMonth() + 1;
      
      // Count diagnoses by month
      report.diagnosesByMonth[month] = (report.diagnosesByMonth[month] || 0) + 1;

      // Count diagnoses by clinic
      report.diagnosesByClinic[diagnosis.clinic.name] = (report.diagnosesByClinic[diagnosis.clinic.name] || 0) + 1;

      // Count diagnoses by doctor
      report.diagnosesByDoctor[diagnosis.doctor.name] = (report.diagnosesByDoctor[diagnosis.doctor.name] || 0) + 1;

      // Count diagnoses by device
      report.topDevices[diagnosis.deviceId.deviceId] = (report.topDevices[diagnosis.deviceId.deviceId] || 0) + 1;
    });

    // Sort and limit top devices
    report.topDevices = Object.entries(report.topDevices)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;