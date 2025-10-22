#!/bin/bash

# Активируем Node.js окружение
export NODE_ENV=production

# Переходим в директорию с проектом
cd $HOME/herowars/www

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Запускаем миграции базы данных
echo "Running database migrations..."
node migrate.js

# Запускаем приложение
echo "Starting application..."
node server.js
