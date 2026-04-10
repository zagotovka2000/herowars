const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Главный тестовый эндпоинт
app.get('/api/stronghold/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server works!' });
});

// Заглушка для /defenses – без базы данных
app.get('/api/stronghold/defenses', (req, res) => {
  res.json([]);
});

// Любой другой запрос /api/stronghold/*
app.all('/api/stronghold/*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
