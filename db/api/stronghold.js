const serverless = require('serverless-http');
const app = require('../app'); // наше Express приложение

// Оборачиваем Express в serverless-функцию
module.exports.handler = serverless(app);
