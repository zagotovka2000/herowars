const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/stronghold', require('./routes/strongholdRoutes'));





module.exports = app;
