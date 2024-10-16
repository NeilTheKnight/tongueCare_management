const express = require('express');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validate');
const { agentSchema } = require('../validations/schemas');

const router = express.Router();

// Create a new agent
router.post('/', [auth, roleAuth(['admin']), validate(agentSchema)], async (req, res) => {
  try {
    const agent = new Agent({
      ...req.body,
      user: req.user._id
    });
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ... rest of the file remains the same