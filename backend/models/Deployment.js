const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repoName: {
    type: String,
    required: true
  },
  repoFullName: {
    type: String,
    required: true
  },
  repoUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'cloning', 'building', 'testing', 'quality_check', 'packaging', 'deploying', 'live', 'failed'],
    default: 'pending'
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    message: String,
    stage: String
  }],
  liveUrl: String,
  errorMessage: String
}, {
  timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('Deployment', deploymentSchema);
