const Joi = require('joi');

// ... (previous schemas remain unchanged)

const maintenanceSchema = Joi.object({
  deviceId: Joi.string().required(),
  maintenanceType: Joi.string().required(),
  description: Joi.string().required(),
  nextMaintenanceDate: Joi.date().greater('now').required()
});

module.exports = {
  userSchema,
  loginSchema,
  agentSchema,
  clinicSchema,
  deviceSchema,
  diagnosisSchema,
  updateDeviceSchema,
  updateDiagnosisSchema,
  maintenanceSchema
};