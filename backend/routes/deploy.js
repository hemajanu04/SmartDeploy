const router = require('express').Router();
const Deployment = require('../models/Deployment');

// Trigger new deployment
router.post('/trigger', async (req, res) => {
  try {
    const { userId, repoName, repoFullName, repoUrl } = req.body;
    
    // Create deployment record
    const deployment = new Deployment({
      userId,
      repoName,
      repoFullName,
      repoUrl,
      status: 'pending',
      logs: [{ message: 'Deployment initiated', stage: 'pending' }]
    });
    
    await deployment.save();
    
    // Start the pipeline simulation (async - don't wait)
    simulatePipeline(deployment._id);
    
    res.json({ 
      success: true, 
      deploymentId: deployment._id,
      message: 'Deployment started' 
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get deployment status
router.get('/status/:deploymentId', async (req, res) => {
  try {
    const deployment = await Deployment.findById(req.params.deploymentId);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    res.json(deployment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get deployment history for user
router.get('/history/:userId', async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }) // Newest first
      .limit(50);
    res.json(deployments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate the CI/CD pipeline (this simulates Steps 4-10 from your synopsis)
async function simulatePipeline(deploymentId) {
  const updateStatus = async (status, message) => {
    await Deployment.findByIdAndUpdate(deploymentId, {
      status,
      $push: { 
        logs: { 
          message, 
          stage: status,
          timestamp: new Date() 
        } 
      }
    });
    console.log(`[Deploy ${deploymentId}] ${status}: ${message}`);
  };

  try {
    // Step 1: Pending (already set)
    await new Promise(r => setTimeout(r, 2000));
    
    // Step 2: Cloning
    await updateStatus('cloning', 'Cloning repository from GitHub...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 3: Building
    await updateStatus('building', 'Building application... Detecting stack and running build tools...');
    await new Promise(r => setTimeout(r, 4000));
    
    // Step 4: Testing
    await updateStatus('testing', 'Running unit tests...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 5: Quality Check
    await updateStatus('quality_check', 'Running SonarCloud quality analysis...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 6: Packaging
    await updateStatus('packaging', 'Building Docker image and pushing to DockerHub...');
    await new Promise(r => setTimeout(r, 4000));
    
    // Step 7: Deploying
    await updateStatus('deploying', 'Deploying to Railway.app cloud...');
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 8: LIVE!
    const liveUrl = `https://${deploymentId.toString().slice(-8)}-smartdeploy.up.railway.app`;
    await Deployment.findByIdAndUpdate(deploymentId, {
      status: 'live',
      liveUrl,
      $push: { 
        logs: { 
          message: `Deployment successful! Live at: ${liveUrl}`, 
          stage: 'live',
          timestamp: new Date() 
        } 
      }
    });
    
    console.log(`[Deploy ${deploymentId}] LIVE: ${liveUrl}`);
    
  } catch (err) {
    await Deployment.findByIdAndUpdate(deploymentId, {
      status: 'failed',
      errorMessage: err.message
    });
    console.error(`[Deploy ${deploymentId}] FAILED:`, err.message);
  }
}

module.exports = router;
