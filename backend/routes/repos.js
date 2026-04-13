const router = require('express').Router();
const axios = require('axios');
const User = require('../models/User');

// Get all GitHub repositories for a user
router.get('/:userId', async (req, res) => {
  try {
    // Find user in our database
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch repos from GitHub API using stored access token
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${user.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    // Format the data we need
    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      updatedAt: repo.updated_at,
      cloneUrl: repo.clone_url,
      htmlUrl: repo.html_url
    }));

    res.json(repos);
    
  } catch (err) {
    console.error('GitHub API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

module.exports = router;
