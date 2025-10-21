require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(cors({
   origin: [
     'https://your-frontend-domain.vercel.app', // Замените на ваш фронтенд URL
     'http://localhost:3000', // Для локальной разработки
     process.env.FRONTEND_URL // Из переменных окружения
   ].filter(Boolean),
   credentials: true
 }));

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

module.exports = app;
