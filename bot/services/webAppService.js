class WebAppService {
   constructor(models, userService, battleService) {
     this.models = models;
     this.userService = userService;
     this.battleService = battleService;
   }
 
   // Генерация HTML для Web App управления командой
   generateTeamManagementHTML(telegramId, initData) {
     return `
 <!DOCTYPE html>
 <html>
 <head>
     <title>Управление командой - Hero Wars</title>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <script src="https://telegram.org/js/telegram-web-app.js"></script>
     <style>
         * {
             margin: 0;
             padding: 0;
             box-sizing: border-box;
         }
         body {
             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
             min-height: 100vh;
             padding: 20px;
         }
         .container {
             max-width: 800px;
             margin: 0 auto;
         }
         .header {
             text-align: center;
             color: white;
             margin-bottom: 30px;
         }
         .header h1 {
             font-size: 24px;
             margin-bottom: 10px;
         }
         .user-info {
             background: rgba(255,255,255,0.1);
             padding: 15px;
             border-radius: 15px;
             margin-bottom: 20px;
             backdrop-filter: blur(10px);
         }
         .team-section, .heroes-section {
             background: white;
             border-radius: 15px;
             padding: 20px;
             margin-bottom: 20px;
             box-shadow: 0 8px 32px rgba(0,0,0,0.1);
         }
         .section-title {
             font-size: 18px;
             font-weight: bold;
             margin-bottom: 15px;
             color: #333;
             display: flex;
             justify-content: space-between;
             align-items: center;
         }
         .team-slots {
             display: grid;
             grid-template-columns: repeat(5, 1fr);
             gap: 10px;
             margin-bottom: 20px;
         }
         .team-slot {
             border: 2px dashed #ccc;
             border-radius: 10px;
             height: 80px;
             display: flex;
             align-items: center;
             justify-content: center;
             background: #f8f9fa;
             transition: all 0.3s ease;
         }
         .team-slot.filled {
             border-color: #28a745;
             background: #f8fff9;
         }
         .team-slot.empty {
             border-color: #dc3545;
         }
         .hero-card {
             border: 2px solid #e9ecef;
             border-radius: 10px;
             padding: 15px;
             margin-bottom: 10px;
             cursor: pointer;
             transition: all 0.3s ease;
             background: white;
         }
         .hero-card:hover {
             border-color: #007bff;
             transform: translateY(-2px);
             box-shadow: 0 4px 12px rgba(0,123,255,0.2);
         }
         .hero-card.selected {
             border-color: #28a745;
             background: #f8fff9;
         }
         .hero-header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 8px;
         }
         .hero-name {
             font-weight: bold;
             font-size: 16px;
         }
         .hero-class {
             color: #6c757d;
             font-size: 14px;
         }
         .hero-stats {
             display: grid;
             grid-template-columns: repeat(2, 1fr);
             gap: 5px;
             font-size: 12px;
             color: #495057;
         }
         .buttons {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 10px;
             margin-top: 20px;
         }
         .btn {
             padding: 15px;
             border: none;
             border-radius: 10px;
             font-size: 16px;
             font-weight: bold;
             cursor: pointer;
             transition: all 0.3s ease;
         }
         .btn-primary {
             background: #007bff;
             color: white;
         }
         .btn-success {
             background: #28a745;
             color: white;
         }
         .btn:disabled {
             background: #6c757d;
             cursor: not-allowed;
         }
         .battle-btn {
             background: linear-gradient(45deg, #ff6b6b, #ee5a24);
             color: white;
             padding: 20px;
             font-size: 18px;
             margin-top: 10px;
         }
         .emoji {
             font-size: 20px;
             margin-right: 5px;
         }
     </style>
 </head>
 <body>
     <div class="container">
         <div class="header">
             <h1>🎯 Управление командой</h1>
             <div class="user-info">
                 <div>Игрок: ${initData.user.username}</div>
                 <div>Уровень: ${initData.user.level} | Золото: ${initData.user.gold}</div>
             </div>
         </div>
 
         <div class="team-section">
             <div class="section-title">
                 <span>👥 Ваша команда</span>
                 <span id="teamCount">${initData.team ? initData.team.heroes.length : 0}/5</span>
             </div>
             <div class="team-slots" id="teamSlots">
                 ${this.generateTeamSlots(initData)}
             </div>
         </div>
 
         <div class="heroes-section">
             <div class="section-title">
                 <span>🎯 Доступные герои</span>
                 <span id="selectedCount">0 выбрано</span>
             </div>
             <div id="heroesList">
                 ${this.generateHeroesList(initData)}
             </div>
         </div>
 
         <div class="buttons">
             <button class="btn btn-primary" onclick="saveTeam()">💾 Сохранить команду</button>
             <button class="btn btn-success" onclick="clearSelection()">🗑️ Очистить</button>
         </div>
 
         <button class="btn battle-btn" onclick="startBattle()" id="battleBtn" disabled>
             ⚔️ В БОЙ!
         </button>
     </div>
 
     <script>
         let selectedHeroes = [];
         const maxTeamSize = 5;
 
         function generateTeamSlots() {
             const slots = [];
             for (let i = 1; i <= maxTeamSize; i++) {
                 const hero = selectedHeroes[i - 1];
                 if (hero) {
                     slots.push(\`
                         <div class="team-slot filled" onclick="removeFromTeam(\${i})">
                             <div>
                                 <div class="emoji">\${hero.emoji}</div>
                                 <div style="font-size: 12px; margin-top: 5px;">\${hero.name}</div>
                             </div>
                         </div>
                     \`);
                 } else {
                     slots.push(\`
                         <div class="team-slot empty">
                             <div style="color: #6c757d;">Слот \${i}</div>
                         </div>
                     \`);
                 }
             }
             return slots.join('');
         }
 
         function updateUI() {
             document.getElementById('teamSlots').innerHTML = generateTeamSlots();
             document.getElementById('teamCount').textContent = \`\${selectedHeroes.length}/\${maxTeamSize}\`;
             document.getElementById('selectedCount').textContent = \`\${selectedHeroes.length} выбрано\`;
             
             const battleBtn = document.getElementById('battleBtn');
             battleBtn.disabled = selectedHeroes.length !== maxTeamSize;
             
             // Обновляем состояние кнопок героев
             document.querySelectorAll('.hero-card').forEach(card => {
                 const heroId = parseInt(card.dataset.heroId);
                 const isSelected = selectedHeroes.some(h => h.id === heroId);
                 card.classList.toggle('selected', isSelected);
             });
         }
 
         function addToTeam(hero) {
             if (selectedHeroes.length >= maxTeamSize) {
                 alert('Команда уже полная! Максимум 5 героев.');
                 return;
             }
             
             if (selectedHeroes.some(h => h.id === hero.id)) {
                 alert('Этот герой уже в команде!');
                 return;
             }
             
             selectedHeroes.push(hero);
             updateUI();
         }
 
         function removeFromTeam(position) {
             if (position > 0 && position <= selectedHeroes.length) {
                 selectedHeroes.splice(position - 1, 1);
                 updateUI();
             }
         }
 
         function clearSelection() {
             selectedHeroes = [];
             updateUI();
         }
 
         async function saveTeam() {
             if (selectedHeroes.length === 0) {
                 alert('Выберите героев для команды!');
                 return;
             }
 
             try {
                 const heroIds = selectedHeroes.map(h => h.id);
                 const response = await fetch('/api/webapp/update-team', {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                     },
                     body: JSON.stringify({
                         telegramId: ${initData.user.id},
                         heroIds: heroIds
                     })
                 });
 
                 const result = await response.json();
                 
                 if (result.success) {
                     alert('✅ Команда успешно сохранена!');
                 } else {
                     alert('❌ Ошибка: ' + result.message);
                 }
             } catch (error) {
                 alert('❌ Ошибка сохранения команды');
                 console.error('Save team error:', error);
             }
         }
 
         function startBattle() {
             if (selectedHeroes.length !== maxTeamSize) {
                 alert('Соберите полную команду из 5 героев!');
                 return;
             }
 
             // Закрываем текущее окно и открываем окно боя
             Telegram.WebApp.showAlert('⚔️ Начинаем битву!', () => {
                 Telegram.WebApp.openTelegramLink('https://t.me/your_bot_name?start=battle');
             });
         }
 
         // Инициализация выбранных героев из текущей команды
         selectedHeroes = ${JSON.stringify(initData.team ? initData.team.heroes : [])};
         updateUI();
 
         // Инициализация Telegram Web App
         Telegram.WebApp.ready();
         Telegram.WebApp.expand();
     </script>
 </body>
 </html>
     `;
   }
 
   generateTeamSlots(initData) {
     let slotsHTML = '';
     for (let i = 1; i <= 5; i++) {
       const hero = initData.team ? initData.team.heroes[i - 1] : null;
       if (hero) {
         slotsHTML += `
           <div class="team-slot filled" onclick="removeFromTeam(${i})">
             <div>
               <div class="emoji">${hero.emoji}</div>
               <div style="font-size: 12px; margin-top: 5px;">${hero.name}</div>
             </div>
           </div>
         `;
       } else {
         slotsHTML += `
           <div class="team-slot empty">
             <div style="color: #6c757d;">Слот ${i}</div>
           </div>
         `;
       }
     }
     return slotsHTML;
   }
 
   generateHeroesList(initData) {
     if (!initData.availableHeroes || initData.availableHeroes.length === 0) {
       return '<div style="text-align: center; color: #6c757d; padding: 20px;">Нет доступных героев</div>';
     }
 
     return initData.availableHeroes.map(hero => `
       <div class="hero-card" data-hero-id="${hero.id}" onclick="addToTeam(${JSON.stringify(hero).replace(/"/g, '&quot;')})">
         <div class="hero-header">
           <div class="hero-name">${hero.emoji} ${hero.name}</div>
           <div class="hero-class">${hero.heroClass}</div>
         </div>
         <div class="hero-stats">
           <div>❤️ ${hero.health}</div>
           <div>⚔️ ${hero.attack}</div>
           <div>🛡️ ${hero.defense}</div>
           <div>🏃 ${hero.speed}</div>
         </div>
       </div>
     `).join('');
   }
 
   // Генерация HTML для Web App боя
   generateBattleHTML(battleSteps, userTeam, opponentTeam) {
     return `
 <!DOCTYPE html>
 <html>
 <head>
     <title>Битва - Hero Wars</title>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <script src="https://telegram.org/js/telegram-web-app.js"></script>
     <style>
         * {
             margin: 0;
             padding: 0;
             box-sizing: border-box;
         }
         body {
             font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
             background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
             min-height: 100vh;
             padding: 20px;
             color: white;
         }
         .battle-container {
             max-width: 800px;
             margin: 0 auto;
         }
         .battle-header {
             text-align: center;
             margin-bottom: 30px;
         }
         .battle-field {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 20px;
             margin-bottom: 30px;
         }
         .team {
             background: rgba(255,255,255,0.1);
             border-radius: 15px;
             padding: 20px;
             backdrop-filter: blur(10px);
         }
         .team-title {
             text-align: center;
             font-weight: bold;
             margin-bottom: 15px;
             font-size: 18px;
         }
         .hero-battle {
             margin-bottom: 15px;
             padding: 10px;
             background: rgba(0,0,0,0.3);
             border-radius: 10px;
         }
         .hero-name {
             display: flex;
             align-items: center;
             margin-bottom: 8px;
             font-weight: bold;
         }
         .health-bar {
             width: 100%;
             height: 20px;
             background: #555;
             border-radius: 10px;
             overflow: hidden;
             margin-bottom: 5px;
         }
         .health-fill {
             height: 100%;
             background: linear-gradient(90deg, #4CAF50, #8BC34A);
             transition: width 0.5s ease;
         }
         .health-text {
             font-size: 12px;
             text-align: center;
         }
         .battle-log {
             background: rgba(0,0,0,0.5);
             border-radius: 10px;
             padding: 15px;
             max-height: 200px;
             overflow-y: auto;
             margin-bottom: 20px;
         }
         .log-entry {
             margin-bottom: 8px;
             padding: 8px;
             background: rgba(255,255,255,0.1);
             border-radius: 5px;
             font-size: 14px;
         }
         .controls {
             text-align: center;
         }
         .btn {
             padding: 15px 30px;
             border: none;
             border-radius: 10px;
             font-size: 16px;
             font-weight: bold;
             cursor: pointer;
             background: #e74c3c;
             color: white;
             margin: 0 10px;
         }
         .action-highlight {
             animation: highlight 0.5s ease;
         }
         @keyframes highlight {
             0% { background: rgba(255,255,255,0.3); }
             100% { background: transparent; }
         }
         .critical {
             color: #ffeb3b;
             font-weight: bold;
         }
         .death {
             color: #e74c3c;
             font-weight: bold;
         }
     </style>
 </head>
 <body>
     <div class="battle-container">
         <div class="battle-header">
             <h1>⚔️ БИТВА НАЧАЛАСЬ!</h1>
             <div id="roundInfo">Раунд 1</div>
         </div>
 
         <div class="battle-field">
             <div class="team" id="team1">
                 <div class="team-title">🎯 Ваша команда</div>
                 <div id="team1Heroes"></div>
             </div>
             <div class="team" id="team2">
                 <div class="team-title">👹 Противник</div>
                 <div id="team2Heroes"></div>
             </div>
         </div>
 
         <div class="battle-log" id="battleLog"></div>
 
         <div class="controls">
             <button class="btn" onclick="nextStep()" id="nextBtn">▶️ Следующий ход</button>
             <button class="btn" onclick="autoBattle()" id="autoBtn">⚡ Автобой</button>
         </div>
     </div>
 
     <script>
         const battleSteps = ${JSON.stringify(battleSteps)};
         let currentStep = 0;
         let autoBattleInterval = null;
 
         function updateBattleField(step) {
             // Обновляем команду 1
             const team1Heroes = document.getElementById('team1Heroes');
             team1Heroes.innerHTML = step.heroes1.map(hero => \`
                 <div class="hero-battle" id="hero-\${hero.id}">
                     <div class="hero-name">
                         <span class="emoji">\${hero.emoji}</span>
                         \${hero.name}
                     </div>
                     <div class="health-bar">
                         <div class="health-fill" style="width: \${(hero.currentHealth / hero.maxHealth) * 100}%"></div>
                     </div>
                     <div class="health-text">\${Math.round(hero.currentHealth)}/\${hero.maxHealth}</div>
                 </div>
             \`).join('');
 
             // Обновляем команду 2
             const team2Heroes = document.getElementById('team2Heroes');
             team2Heroes.innerHTML = step.heroes2.map(hero => \`
                 <div class="hero-battle" id="hero-\${hero.id}">
                     <div class="hero-name">
                         <span class="emoji">\${hero.emoji}</span>
                         \${hero.name}
                     </div>
                     <div class="health-bar">
                         <div class="health-fill" style="width: \${(hero.currentHealth / hero.maxHealth) * 100}%"></div>
                     </div>
                     <div class="health-text">\${Math.round(hero.currentHealth)}/\${hero.maxHealth}</div>
                 </div>
             \`).join('');
 
             // Обновляем информацию о раунде
             document.getElementById('roundInfo').textContent = \`Раунд \${step.round}\`;
 
             // Добавляем запись в лог
             if (step.currentAction) {
                 const logEntry = document.createElement('div');
                 logEntry.className = 'log-entry';
                 
                 if (step.currentAction.type === 'attack') {
                     logEntry.innerHTML = \`
                         \${step.currentAction.attackerEmoji} <b>\${step.currentAction.attacker}</b> атакует 
                         \${step.currentAction.targetEmoji} <b>\${step.currentAction.target}</b> и наносит 
                         <span class="\${step.currentAction.isCritical ? 'critical' : ''}">\${step.currentAction.damage} урона</span>!
                     \`;
                     
                     // Анимация атаки
                     const attackerElement = document.getElementById(\`hero-\${step.heroes1.concat(step.heroes2).find(h => h.name === step.currentAction.attacker).id}\`);
                     const targetElement = document.getElementById(\`hero-\${step.heroes1.concat(step.heroes2).find(h => h.name === step.currentAction.target).id}\`);
                     
                     if (attackerElement) attackerElement.classList.add('action-highlight');
                     if (targetElement) targetElement.classList.add('action-highlight');
                     
                     setTimeout(() => {
                         if (attackerElement) attackerElement.classList.remove('action-highlight');
                         if (targetElement) targetElement.classList.remove('action-highlight');
                     }, 500);
                     
                 } else if (step.currentAction.type === 'death') {
                     logEntry.innerHTML = \`
                         <span class="death">💀 \${step.currentAction.targetEmoji} <b>\${step.currentAction.target}</b> повержен!</span>
                     \`;
                 }
                 
                 document.getElementById('battleLog').appendChild(logEntry);
                 document.getElementById('battleLog').scrollTop = document.getElementById('battleLog').scrollHeight;
             }
 
             // Проверяем окончание боя
             if (step.isFinished) {
                 document.getElementById('nextBtn').disabled = true;
                 document.getElementById('autoBtn').disabled = true;
                 
                 const resultMessage = step.winner === 'team1' ? '🎉 Вы победили!' : 
                                    step.winner === 'team2' ? '💀 Вы проиграли!' : 
                                    '⚔️ Ничья!';
                 
                 const finalLog = document.createElement('div');
                 finalLog.className = 'log-entry';
                 finalLog.style.background = 'rgba(255,255,255,0.2)';
                 finalLog.style.fontWeight = 'bold';
                 finalLog.textContent = resultMessage;
                 document.getElementById('battleLog').appendChild(finalLog);
                 
                 clearInterval(autoBattleInterval);
             }
         }
 
         function nextStep() {
             if (currentStep < battleSteps.length) {
                 updateBattleField(battleSteps[currentStep]);
                 currentStep++;
             }
         }
 
         function autoBattle() {
             const nextBtn = document.getElementById('nextBtn');
             const autoBtn = document.getElementById('autoBtn');
             
             nextBtn.disabled = true;
             autoBtn.disabled = true;
             autoBtn.textContent = '⏸️ Пауза';
             
             autoBattleInterval = setInterval(() => {
                 if (currentStep < battleSteps.length) {
                     nextStep();
                 } else {
                     clearInterval(autoBattleInterval);
                     autoBtn.textContent = '⚡ Автобой';
                     autoBtn.disabled = false;
                 }
             }, 1500);
             
             autoBtn.onclick = function() {
                 clearInterval(autoBattleInterval);
                 nextBtn.disabled = false;
                 autoBtn.disabled = false;
                 autoBtn.textContent = '⚡ Автобой';
                 autoBtn.onclick = autoBattle;
             };
         }
 
         // Начинаем бой
         updateBattleField(battleSteps[0]);
         currentStep = 1;
 
         // Инициализация Telegram Web App
         Telegram.WebApp.ready();
         Telegram.WebApp.expand();
     </script>
 </body>
 </html>
     `;
   }
 }
 
 module.exports = WebAppService;
