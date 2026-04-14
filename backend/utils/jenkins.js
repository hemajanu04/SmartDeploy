const axios = require('axios');

const JENKINS_URL = 'http://localhost:8080';
const JENKINS_USER = 'admin';
const JENKINS_TOKEN = process.env.JENKINS_API_TOKEN;

async function triggerBuild(repoUrl, repoName) {
  try {
    console.log('Triggering Jenkins for:', repoName);
    console.log('Repo URL:', repoUrl);
    
    // Step 1: Get crumb token
    const crumbRes = await axios.get(`${JENKINS_URL}/crumbIssuer/api/json`, {
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN
      }
    });
    
    const crumb = crumbRes.data.crumb;
    const crumbField = crumbRes.data.crumbRequestField;
    
    // Step 2: Build URL with parameters
    // Jenkins expects parameters in the URL for buildWithParameters
    const params = new URLSearchParams();
    params.append('REPO_URL', repoUrl);
    params.append('REPO_NAME', repoName);
    
    const buildUrl = `${JENKINS_URL}/job/smartdeploy-pipeline/buildWithParameters?${params.toString()}`;
    
    console.log('Calling URL:', buildUrl);
    
    const response = await axios.post(buildUrl, null, {
      headers: {
        [crumbField]: crumb
      },
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN
      }
    });
    
    console.log('Jenkins triggered:', response.status);
    return { success: true, status: response.status };
    
  } catch (err) {
    console.error('Jenkins error:', err.response?.status, err.message);
    throw new Error(`Jenkins trigger failed: ${err.message}`);
  }
}

async function getBuildInfo(buildNumber) {
  try {
    const res = await axios.get(
      `${JENKINS_URL}/job/smartdeploy-pipeline/${buildNumber}/api/json`,
      {
        auth: {
          username: JENKINS_USER,
          password: JENKINS_TOKEN
        }
      }
    );
    return res.data;
  } catch (err) {
    return null;
  }
}

module.exports = {
  triggerBuild,
  getBuildInfo
};
