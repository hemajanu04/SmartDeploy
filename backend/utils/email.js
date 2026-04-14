const nodemailer = require('nodemailer');

// Create transporter (use Gmail or any SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // your-email@gmail.com
    pass: process.env.EMAIL_PASS      // app-password (not your real password)
  }
});

async function sendDeploymentEmail(userEmail, repoName, liveUrl, status) {
  try {
    const subject = status === 'success' 
      ? `✅ Your app "${repoName}" is LIVE!` 
      : `❌ Deployment failed for "${repoName}"`;
    
    const html = status === 'success' ? `
      <h2>🎉 Deployment Successful!</h2>
      <p>Your application <strong>${repoName}</strong> has been successfully deployed.</p>
      <p><strong>Live URL:</strong> <a href="${liveUrl}">${liveUrl}</a></p>
      <p>Share this link with your friends!</p>
      <hr>
      <p><small>Deployed via SmartDeploy</small></p>
    ` : `
      <h2>❌ Deployment Failed</h2>
      <p>Unfortunately, the deployment for <strong>${repoName}</strong> failed.</p>
      <p>Please check your code and try again.</p>
      <hr>
      <p><small>SmartDeploy</small></p>
    `;
    
    await transporter.sendMail({
      from: '"SmartDeploy" <smartdeploy@example.com>',
      to: userEmail,
      subject: subject,
      html: html
    });
    
    console.log('Email sent to:', userEmail);
  } catch (err) {
    console.error('Email error:', err);
  }
}

module.exports = { sendDeploymentEmail };
