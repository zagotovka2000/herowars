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
  windowMs: 15 * 60 * 1000,
  max: 1000, // увеличенный лимит для разработки
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// CORS настройки
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://frontend-herowars.vercel.app",
      "http://localhost:3000",
      "https://herowars.alwaysdata.net"
    ];
    
    // Разрешаем запросы без origin (например, от мобильных приложений, Telegram)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());

// Детальное логирование для разработки
app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

module.exports = app;
