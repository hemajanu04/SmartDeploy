const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('./models/User');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'smartdeploy-secret-key-2024',
  resave: false,
  saveUninitialized: false
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/github/callback",
    scope: ['user:email', 'repo', 'read:user']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      
      let email = profile.emails?.[0]?.value || null;
      
      if (!email && accessToken) {
        try {
          const axios = require('axios');
          const emailRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` }
          });
          const primaryEmail = emailRes.data.find(e => e.primary && e.verified);
          email = primaryEmail ? primaryEmail.email : emailRes.data[0]?.email;
          console.log('Fetched email from GitHub API:', email);
        } catch (e) {
          console.log('Could not fetch email:', e.message);
        }
      }
      
      if (!user) {
        user = new User({
          githubId: profile.id,
          username: profile.username,
          email: email,
          accessToken: accessToken
        });
        await user.save();
        console.log('✅ New user created:', user.username, 'Email:', user.email);
      } else {
        if (email && !user.email) {
          user.email = email;
          await user.save();
          console.log('✅ Updated email for:', user.username, 'Email:', user.email);
        }
        user.accessToken = accessToken;
        await user.save();
        console.log('User logged in:', user.username);
      }
      
      done(null, user);
    } catch (err) {
      console.error('GitHub OAuth Error:', err);
      done(err, null);
    }
  }
));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/smartdeploy')
  .then(() => console.log('✅ MongoDB Connected from D Drive!'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// Routes

// 1. GitHub Login
app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// 2. GitHub Callback
app.get('/api/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000' }),
  (req, res) => {
    res.redirect(`http://localhost:3000/dashboard?userId=${req.user._id}`);
  }
);

// 3. Get User Info
app.get('/api/auth/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json({ username: user.username, email: user.email });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Logout
app.get('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// 5. Repository Routes
app.use('/api/repos', require('./routes/repos'));

// 6. Deployment Routes
app.use('/api/deploy', require('./routes/deploy'));

// 7. Test Route
app.get('/', (req, res) => {
  res.send('<h1>SmartDeploy Server Running! 🚀</h1><p>Day 6: All Features Complete!</p>');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🌟 Server running on http://localhost:${PORT}`);
});
