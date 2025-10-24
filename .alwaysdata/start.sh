#!/bin/bash

# Активируем Node.js окружение
export NODE_ENV=production

# Переходим в директорию с проектом
cd $HOME/www

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Запускаем миграции базы данных
echo "Running database migrations..."
node migrate.js

# Устанавливаем вебхук
echo "Setting up webhook..."
node setup-webhook.js

# Запускаем приложение
echo "Starting application..."
node server.js
while true; do
    echo "Starting application..."
    npm start
    echo "Application crashed with exit code $?. Restarting in 5 seconds..."
    sleep 5
done
