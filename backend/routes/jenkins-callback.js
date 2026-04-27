const router = require('express').Router();
const Deployment = require('../models/Deployment');
const { sendDeploymentEmail } = require('../utils/email');
const User = require('../models/User');

// Jenkins calls this when pipeline completes
router.post('/jenkins-callback', async (req, res) => {
  try {
    const { repoName, status, liveUrl, dockerImage } = req.body;
    
    console.log('📞 Jenkins callback received:', { repoName, status, liveUrl });
    
    // Find the latest deployment for this repo
    const deployment = await Deployment.findOne({ repoName }).sort({ createdAt: -1 });
    
    if (deployment) {
      await Deployment.findByIdAndUpdate(deployment._id, {
        status,
        liveUrl: liveUrl || deployment.liveUrl,
        $push: {
          logs: {
            message: status === 'live' 
              ? `🎉 Jenkins pipeline completed! Live at: ${liveUrl}`
              : `❌ Jenkins pipeline failed`,
            stage: status,
            timestamp: new Date()
          }
        }
      });
      
      // Send email notification
      const user = await User.findById(deployment.userId);
      if (user && user.email) {
        await sendDeploymentEmail(user.email, repoName, liveUrl, status);
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Jenkins callback error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
