const axios = require('axios');

const JENKINS_URL = 'http://localhost:8080';
const JENKINS_USER = 'admin';
const JENKINS_TOKEN = process.env.JENKINS_API_TOKEN;

async function triggerBuild(repoUrl, repoName) {
  try {
    console.log('Triggering Jenkins for:', repoName);
    
    // Step 1: Get crumb token (Jenkins security)
    const crumbRes = await axios.get(`${JENKINS_URL}/crumbIssuer/api/json`, {
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN
      }
    });
    
    const crumb = crumbRes.data.crumb;
    const crumbField = crumbRes.data.crumbRequestField;
    
    console.log('Got Jenkins crumb:', crumb);
    
    // Step 2: Trigger build with parameters
    const buildUrl = `${JENKINS_URL}/job/smartdeploy-pipeline/buildWithParameters`;
    
    const response = await axios.post(buildUrl, null, {
      params: {
        REPO_URL: repoUrl,
        REPO_NAME: repoName
      },
      headers: {
        [crumbField]: crumb,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN
      }
    });
    
    console.log('Jenkins triggered:', response.status);
    return { success: true, status: response.status };
    
  } catch (err) {
    console.error('Jenkins error:', err.response?.status, err.response?.data || err.message);
    throw new Error(`Jenkins trigger failed: ${err.response?.status || err.message}`);
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
