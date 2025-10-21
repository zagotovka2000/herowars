#!/bin/bash

# Активируем Node.js окружение
export NODE_ENV=production
export PORT=$PORT

# Переходим в директорию с проектом
cd www/herowars

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    npm install --production
fi

# Запускаем миграции базы данных
node migrate.js

# Запускаем приложение
node server.js
