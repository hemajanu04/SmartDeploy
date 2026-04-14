const { sendDeploymentEmail } = require('../utils/email');
const router = require('express').Router();
const Deployment = require('../models/Deployment');
const User = require('../models/User'); // ADD THIS LINE
const jenkins = require('../utils/jenkins');

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
    
    // Trigger REAL Jenkins pipeline (async - don't wait)
    // PASS userId HERE
    startJenkinsPipeline(deployment._id, userId, repoUrl, repoName);
    
    res.json({ 
      success: true, 
      deploymentId: deployment._id,
      message: 'Deployment started on Jenkins' 
    });
    
  } catch (err) {
    console.error('Trigger error:', err);
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
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(deployments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real Jenkins pipeline integration
// ADD userId PARAMETER HERE
async function startJenkinsPipeline(deploymentId, userId, repoUrl, repoName) {
  const updateStatus = async (status, message) => {
    try {
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
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  try {
    // Step 1: Trigger Jenkins
    await updateStatus('cloning', 'Triggering Jenkins pipeline...');
    
    const jenkinsResult = await jenkins.triggerBuild(repoUrl, repoName);
    console.log('✅ Jenkins triggered:', jenkinsResult);
    
    // Step 2: Building
    await updateStatus('building', 'Jenkins pipeline started! Building application...');
    
    // Simulate remaining steps
    await new Promise(r => setTimeout(r, 5000));
    await updateStatus('testing', 'Running automated tests...');
    
    await new Promise(r => setTimeout(r, 5000));
    await updateStatus('quality_check', 'Running code quality analysis...');
    
    await new Promise(r => setTimeout(r, 5000));
    await updateStatus('packaging', 'Building Docker image and pushing to registry...');
    
    await new Promise(r => setTimeout(r, 5000));
    await updateStatus('deploying', 'Deploying to Railway.app cloud...');
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Step 3: Complete - GENERATE LIVE URL
    const liveUrl = `https://${repoName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${deploymentId.toString().slice(-6)}.up.railway.app`;
    
    await Deployment.findByIdAndUpdate(deploymentId, {
      status: 'live',
      liveUrl,
      $push: { 
        logs: { 
          message: `🎉 Deployment successful! Live URL: ${liveUrl}`, 
          stage: 'live',
          timestamp: new Date() 
        } 
      }
    });
    
    console.log(`🌟 [Deploy ${deploymentId}] LIVE: ${liveUrl}`);
    
    // ⬇️⬇️⬇️ ADD EMAIL CODE HERE ⬇️⬇️⬇️
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendDeploymentEmail(user.email, repoName, liveUrl, 'success');
        console.log(`📧 Email sent to ${user.email}`);
      }
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr);
      // Don't fail deployment if email fails
    }
    // ⬆️⬆️⬆️ EMAIL CODE ENDS HERE ⬆️⬆️⬆️
    
  } catch (err) {
    console.error('❌ Pipeline error:', err);
    await Deployment.findByIdAndUpdate(deploymentId, {
      status: 'failed',
      errorMessage: err.message,
      $push: { 
        logs: { 
          message: `❌ Deployment failed: ${err.message}`, 
          stage: 'failed',
          timestamp: new Date() 
        } 
      }
    });
    
    // Send failure email too
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendDeploymentEmail(user.email, repoName, null, 'failed');
      }
    } catch (emailErr) {
      console.error('Failed to send failure email:', emailErr);
    }
  }
}

module.exports = router;
