const express = require('express');
const router = express.Router();
const {
  createGuild,
  getGuildInfo,
  joinGuild,
  leaveGuild,
  updateGuildMember,
  getGuildMembers,
  donateToGuild,
  getGuildBattles,
  updateGuildSettings,
  disbandGuild
} = require('../controllers/guildController');

// Создание и основная информация
router.post('/', createGuild);
router.get('/:guildId', getGuildInfo);
router.put('/:guildId/settings', updateGuildSettings);
router.delete('/:guildId', disbandGuild);

// Участники
router.post('/:guildId/join', joinGuild);
router.post('/:guildId/leave', leaveGuild);
router.put('/:guildId/members/:userId', updateGuildMember);
router.get('/:guildId/members', getGuildMembers);

// Донаты и активность
router.post('/:guildId/donate', donateToGuild);
router.get('/:guildId/battles', getGuildBattles);

module.exports = router;
