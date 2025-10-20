require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); 
const compression = require('compression');//для сжатия ответов.
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');//для ограничения запросов

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

module.exports = app;
