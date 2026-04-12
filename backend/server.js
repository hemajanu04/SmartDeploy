const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (running on D drive!)
mongoose.connect('mongodb://127.0.0.1:27017/smartdeploy')
  .then(() => console.log('✅ SUCCESS! MongoDB Connected from D Drive!'))
  .catch(err => console.log('❌ MongoDB Error:', err.message));

// Test route - http://localhost:5000/
app.get('/', (req, res) => {
  res.send('<h1>SmartDeploy Server Running! 🚀</h1><p>Day 1 Complete!</p>');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🌟 Server running on http://localhost:${PORT}`);
});
