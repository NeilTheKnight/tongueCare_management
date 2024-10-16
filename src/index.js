require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const clinicRoutes = require('./routes/clinics');
const deviceRoutes = require('./routes/devices');
const diagnosisRoutes = require('./routes/diagnosis');
const reportRoutes = require('./routes/reports');
const maintenanceRoutes = require('./routes/maintenance');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch((err) => logger.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/diagnosis', diagnosisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Server running on port ${port}`));