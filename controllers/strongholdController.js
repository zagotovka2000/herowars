const { GlobalStronghold } = require('../db/models');
const { FORTS, emptySlot } = require('../config/strongholdConstants');

const getGlobalDefenses = async (req, res) => {
  try {
    let record = await GlobalStronghold.findByPk(1);
    if (!record) {
      // Создаём пустую структуру на основе актуального FORTS
      const emptyData = FORTS.map((fort, idx) =>
        Array(fort.slots).fill(JSON.parse(JSON.stringify(emptySlot)))
      );
      record = await GlobalStronghold.create({ id: 1, data: emptyData });
    }
    res.json(record.data);
  } catch (error) {
    console.error('Ошибка получения защит:', error);
    res.status(500).json({ error: error.message });
  }
};

const saveGlobalDefenses = async (req, res) => {
  try {
    const newData = req.body;
    // Проверяем только то, что это непустой массив (без жёсткой привязки к длине)
    if (!Array.isArray(newData) || newData.length === 0) {
      return res.status(400).json({ error: 'Неверный формат данных' });
    }
    // Сохраняем как есть
    await GlobalStronghold.upsert({ id: 1, data: newData });
    res.json({ message: 'Конфигурация сохранена' });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGlobalDefenses, saveGlobalDefenses };
