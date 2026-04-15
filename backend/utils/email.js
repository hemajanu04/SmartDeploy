const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendDeploymentEmail(userEmail, repoName, liveUrl, status) {
  try {
    const subject = status === 'success' 
      ? `✅ Your app "${repoName}" is LIVE!` 
      : `❌ Deployment failed for "${repoName}"`;
    
    const html = status === 'success' ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4CAF50;">🎉 Deployment Successful!</h2>
        <p>Your application <strong>${repoName}</strong> has been successfully deployed via SmartDeploy.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Live URL:</strong> <a href="${liveUrl}" style="color: #2196F3;">${liveUrl}</a></p>
        </div>
        <p>Share this link with your friends!</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Deployed via SmartDeploy</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #f44336;">❌ Deployment Failed</h2>
        <p>Unfortunately, the deployment for <strong>${repoName}</strong> failed.</p>
        <p>Please check your code and try again.</p>
      </div>
    `;
    
    await transporter.sendMail({
      from: '"SmartDeploy" <smartdeploy@gmail.com>',
      to: userEmail,
      subject: subject,
      html: html
    });
    
    console.log('✅ Email sent to:', userEmail);
  } catch (err) {
    console.error('❌ Email error:', err.message);
    throw err;
  }
}

module.exports = { sendDeploymentEmail };
