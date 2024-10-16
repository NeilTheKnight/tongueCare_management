const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { userSchema, loginSchema } = require('../validations/schemas');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/register', validate(userSchema), async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = new User({ email, password, name, role });
    await user.save();

    logger.info(`New user registered: ${user.email}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error('Error in user registration:', error);
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    logger.info(`User logged in: ${user.email}`);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    logger.error('Error in user login:', error);
    next(error);
  }
});

module.exports = router;