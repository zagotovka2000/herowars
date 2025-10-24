cd www
pwd
DATABASE_URL="postgresql://herowars:L7Bj_9KK938KMjC@postgresql-herowars.alwaysdata.net:5432/herowars_database" BOT_TOKEN="8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA" WEBHOOK_DOMAIN="herowars.alwaysdata.net" node webhook-setup.js set
cd ..
rm -rf www
mkdir www
cd www
ls
git clone https://github.com/zagotovka2000/herowars.git .
node migrate.js
npm install --production
node migrate.js
node migrate.js
ls
cd ..
pwd
ls
rm -rf www
mkdir www
cd www
git clone https://github.com/zagotovka2000/herowars.git .
npm install --production
node migrate.js
npm install
node migrate.js
cd ..
ls
rm -rf www
mkdir
cd www
mkdir www
cd www
git clone https://github.com/zagotovka2000/herowars.git .
npm install
node migrate.js
pwd
ls
nano .env
node migrate.js
node webhook-setup.js
nano setup-webhook.js
node setup-webhook.js
node server.js
nano .alwaysdata/start.sh
chmod +x .alwaysdata/start.sh
nano server.js
curl http://localhost:3000/health
node server.js
curl http://localhost:3000/health
nano check-port.js
node check-port.js
netstat -i
nano server.js
node server.js
ps aux | grep node
ss -tlnp | grep -E ':(3000|8100|8101)'
netstat -tlnp 2>/dev/null | grep -E ':(3000|8100|8101)'
env | grep -i port
echo "ALWAYSDATA_HTTP_PORT: $ALWAYSDATA_HTTP_PORT"
echo "PORT: $PORT"
nano server.js
nano .env
nano .env
node server.js
ps aux | grep node
netstat -tln | grep 8100
ss -tln | grep 8100
nano server.js
pkill -f node
pwd
nohup node server.js > server.log 2>&1 &
ps aux | grep node
tail -f server.log
pkill -f node
nano .env
node server.js
ls
rm check-port.js
ls
pwd
s -la .env
chmod 600 /home/herowars/.env
ls
npm install pm2
pwd
touch ecosystem.config.js
ls
nano ecosystem.config.js
mkdir logs
./node_modules/.bin/pm2 status
./node_modules/.bin/pm2 start ecosystem.config.js
./node_modules/.bin/pm2 status
cd logs/
ls
cd ..
ls
cd config/
ls
cd ..
cd .alwaysdata/
ls
nano start.sh
chmod +x start.sh
./node_modules/.bin/pm2 logs herowars-bot
cd ..
cd ..
cd www
./node_modules/.bin/pm2 logs herowars-bot
n
tail -f logs/err-0.log
./node_modules/.bin/pm2 logs herowars-bot --lines 50
netstat -tlnp | grep 8100
pwd
nano server.js
curl -X POST "https://herowars.alwaysdata.net/webhook/8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA" -H "Content-Type: application/json" -d '{"update_id": 123, "message": {"message_id": 1, "from": {"id": 123, "is_bot": false, "first_name": "Test"}, "chat": {"id": 123, "first_name": "Test", "type": "private"}, "date": 123, "text": "test"}}'
curl -X POST "https://api.telegram.org/bot8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA/setWebhook" -H "Content-Type: application/json" -d '{"url": "https://herowars.alwaysdata.net/webhook/8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA", "drop_pending_updates": true}'
curl "https://api.telegram.org/bot8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA/getWebhookInfo"
nano server.js
netstat -tlnp | grep 8100
curl http://localhost:8100/health
clear
ss -tlnp | grep 8100
ps aux | grep node
n
nano server.js
./node_modules/.bin/pm2 logs herowars-bot --lines 100
./node_modules/.bin/pm2 restart herowars-bot
./node_modules/.bin/pm2 stop herowars-bot
node server.js
nano server.js
node server.js
nano server.js
node server.js
nano server.js
node server.js
./node_modules/.bin/pm2 stop herowars-bot
nano server.js
./node_modules/.bin/pm2 start ecosystem.config.js
./node_modules/.bin/pm2 status
./node_modules/.bin/pm2 logs herowars-bot --lines 20
ss -tlnp | grep 8100
curl http://localhost:8100/health
./node_modules/.bin/pm2 start ecosystem.config.js
ss -tlnp | grep 8100
curl http://localhost:8100/health
nano server.js
./node_modules/.bin/pm2 start ecosystem.config.js
curl http://localhost:8100/health
ss -tlnp | grep 8100
curl -I https://herowars.alwaysdata.net/health
nano server.js
./node_modules/.bin/pm2 stop herowars-bot
./node_modules/.bin/pm2 start ecosystem.config.js
./node_modules/.bin/pm2 status
./node_modules/.bin/pm2 logs herowars-bot --lines 10
nano server.js
ss -tlnp | grep 8100
./node_modules/.bin/pm2 status
./node_modules/.bin/pm2 start ecosystem.config.js
./node_modules/.bin/pm2 logs herowars-bot --lines 10
curl http://localhost:8100/health
curl -g -6 "http://[::1]:8100/health"
pm2 restart server.js
npm start
./node_modules/.bin/pm2 stop all
./node_modules/.bin/pm2 delete all
pkill -f node
node server.js
./node_modules/.bin/pm2 stop all
pwd
nano ecosystem.config.js 
nano server.js
./node_modules/.bin/pm2 start ecosystem.config.js
./node_modules/.bin/pm2 logs
nano server.js
./node_modules/.bin/pm2 logs
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook"   -H "Content-Type: application/json"   -d '{"url": "https://herowars.alwaysdata.net/webhook/8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA"}'
 curl -X POST "https://api.telegram.org/bot8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA/setWebhook"   -H "Content-Type: application/json"   -d '{"url": "https://herowars.alwaysdata.net/webhook/8167273556:AAHtbZaQ9VBodxOg7RcZ1HLeSXVX_e0EOjA"}'
nano server.js
nano .env
PORT=8100 ./node_modules/.bin/pm2 start ecosystem.config.js
nano ecosystem.config.js 
PORT=8100 node server.js
