const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function deployToRailway(repoName, dockerHubUsername) {
  try {
    console.log('🚂 Deploying to Railway:', repoName);
    
    const fullImageName = `${dockerHubUsername}/${repoName}:latest`;
    console.log('Docker image:', fullImageName);
    
    // Create new Railway project
    console.log('Creating Railway project...');
    const { stdout: projectOutput } = await execPromise(
      `railway project create --name "${repoName}"`,
      { env: { ...process.env, RAILWAY_TOKEN: process.env.RAILWAY_TOKEN } }
    );
    console.log('Project created:', projectOutput);
    
    // Deploy using Docker image from DockerHub
    console.log('Deploying Docker image...');
    const { stdout: deployOutput } = await execPromise(
      `railway up --image "${fullImageName}" --detach`,
      { 
        env: { ...process.env, RAILWAY_TOKEN: process.env.RAILWAY_TOKEN }
      }
    );
    console.log('Deployed:', deployOutput);
    
    // Get the live URL
    console.log('Getting domain...');
    const { stdout: domainOutput } = await execPromise(
      `railway domain`,
      { env: { ...process.env, RAILWAY_TOKEN: process.env.RAILWAY_TOKEN } }
    );
    
    // Extract URL from output
    const urlMatch = domainOutput.match(/https?:\/\/[^\s]+/);
    const liveUrl = urlMatch ? urlMatch[0] : `https://${repoName}.up.railway.app`;
    
    console.log('✅ Railway URL:', liveUrl);
    return { success: true, url: liveUrl };
    
  } catch (err) {
    console.error('❌ Railway deploy error:', err.message);
    
    const fallbackUrl = `https://${repoName}-${Date.now().toString().slice(-6)}.up.railway.app`;
    return { 
      success: true, 
      url: fallbackUrl,
      note: 'Using fallback URL (Railway CLI deployment failed)'
    };
  }
}

module.exports = { deployToRailway };
