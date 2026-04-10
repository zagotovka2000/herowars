// controllers/strongholdController.js
const { neon } = require('@neondatabase/serverless');

// Встроенные определения FORTS и emptySlot (уберите импорт из strongholdConstants)
const FORTS = [
  { name: 'Мост', type: 'titans', bonus: 'накопление энергии быстрее на ', slots: 6 },
  { name: 'Врата Природы', type: 'titans', bonus: 'снижает урон на ', slots: 4 },
  { name: 'Бастион Льда', type: 'titans', bonus: 'накопление энергии быстрее на ', slots: 4 },
  { name: 'Бастион Огня', type: 'titans', bonus: 'увеличивает здоровье на ', slots: 4 },
  { name: 'Храм Солнца', type: 'titans', bonus: 'снижает урон по защите на ', slots: 4 },
  { name: 'Храм Луны', type: 'titans', bonus: 'увеличивает здоровье на ', slots: 4 },
  { name: 'Источник Стихий', type: 'titans', bonus: 'увеличивает защиту от магии на ', slots: 4 },
  { name: 'Алтарь Жизни', type: 'titans', bonus: 'увеличивает лечение на ', slots: 5 },
  { name: 'Призма Эфира', type: 'titans', bonus: 'увеличивает броню на ', slots: 5 },
  { name: 'Казармы', type: 'heroes', bonus: 'увеличивает здоровье на ', slots: 3 },
  { name: 'Академия Магов', type: 'heroes', bonus: 'увеличивает магический урон на ', slots: 3 },
  { name: 'Маяк', type: 'heroes', bonus: 'увеличена скорость перезарядки умений на ', slots: 5 },
  { name: 'Литейная', type: 'heroes', bonus: 'увеличивает здоровье на ', slots: 5 },
  { name: 'Инженериум', type: 'heroes', bonus: 'накопление энергии быстрее на ', slots: 5 },
  { name: 'Стрельбище', type: 'heroes', bonus: 'снижает урон на ', slots: 5 },
  { name: 'Мост Героев', type: 'heroes', bonus: 'накопление энергии быстрее на ', slots: 6 },
  { name: 'Башня Алхимии', type: 'heroes', bonus: 'увеличивает броню на ', slots: 5 },
  { name: 'Бастион', type: 'heroes', bonus: 'увеличивает защиту от магии на ', slots: 5 },
  { name: 'Цитадель', type: 'heroes', bonus: 'увеличивает здоровье на ', slots: 8 },
  { name: 'Ратуша', type: 'heroes', bonus: 'увеличивает лечение на ', slots: 5 }
];

const emptySlot = {
  playerName: '',
  type: 'heroes',
  lineup: {
    pet: null,
    heroes: [null, null, null, null, null],
    titans: [null, null, null, null, null]
  }
};

/* const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL); */
const sql = null;
const getGlobalDefenses = async (req, res) => {
   if (!sql) {
      return res.status(500).json({ error: 'DB not configured' });
    }
  try {
    const result = await sql`SELECT data FROM "GlobalStrongholds" WHERE id = 1`;
    if (result.length === 0) {
      const emptyData = FORTS.map(fort => Array(fort.slots).fill(JSON.parse(JSON.stringify(emptySlot))));
      return res.json(emptyData);
    }
    res.json(result[0].data);
  } catch (error) {
    console.error('Ошибка получения защит:', error);
    res.status(500).json({ error: error.message });
  }
};

const saveGlobalDefenses = async (req, res) => {
   if (!sql) {
      return res.status(500).json({ error: 'DB not configured' });
    }
  try {
    const newData = req.body;
    if (!Array.isArray(newData) || newData.length === 0) {
      return res.status(400).json({ error: 'Неверный формат данных' });
    }
    await sql`
      INSERT INTO "GlobalStrongholds" (id, data, "createdAt", "updatedAt")
      VALUES (1, ${JSON.stringify(newData)}, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        "updatedAt" = NOW()
    `;
    res.json({ message: 'Конфигурация сохранена' });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: error.message });
  }
};
 
module.exports = { getGlobalDefenses, saveGlobalDefenses };
