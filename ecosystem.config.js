module.exports = {
  apps: [{
    name: 'herowars-bot',
    script: 'node server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8100,
      BOT_TOKEN: process.env.BOT_TOKEN,
      DATABASE_URL: process.env.DATABASE_URL,
      WEBHOOK_DOMAIN: 'herowars.alwaysdata.net'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
