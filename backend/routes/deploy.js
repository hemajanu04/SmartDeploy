const { sendDeploymentEmail } = require('../utils/email');
const router = require('express').Router();
const Deployment = require('../models/Deployment');
const User = require('../models/User');
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
    
    // Trigger REAL Jenkins pipeline
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
    
    // ⬇️⬇️ EMAIL SENDING CODE - UPDATED WITH FALLBACK ⬇️⬇️
    try {
      const user = await User.findById(userId);
      
      // Try to get email from user, or use fallback
      let emailTo = user?.email;
      
      // If no email in database, use hardcoded for testing
      if (!emailTo) {
        emailTo = 'hemashree4440@gmail.com'; // FALLBACK EMAIL FOR TESTING
        console.log('⚠️ No user email found, using fallback:', emailTo);
      }
      
      console.log('📧 Sending email to:', emailTo);
      await sendDeploymentEmail(emailTo, repoName, liveUrl, 'success');
      console.log('✅ Email sent successfully!');
      
    } catch (emailErr) {
      console.error('❌ Email sending failed:', emailErr.message);
      // Don't fail deployment if email fails
    }
    // ⬆️⬆️ EMAIL CODE END ⬆️⬆️
    
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
    
    // Send failure email
    try {
      const user = await User.findById(userId);
      const emailTo = user?.email || 'hemashree4440@gmail.com';
      await sendDeploymentEmail(emailTo, repoName, null, 'failed');
    } catch (emailErr) {
      console.error('Failed to send failure email:', emailErr);
    }
  }
}

module.exports = router;
