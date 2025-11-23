// seeders/XXXXXX-complete-items-seeder.js
'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const items = [];
    const now = new Date();

    // Серые предметы (20 штук) - базовые материалы
    const grayItems = [
      { name: 'chasy_svingera', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.4, energyCost: 5, description: 'chasy_svingera_description' },
      { name: 'zloy_buter', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.5, energyCost: 3, description: 'Злой бутурброд' },
      { name: 'kastrator', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.35, energyCost: 4, description: 'Нож для кострации' },
      { name: 'grib', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.6, energyCost: 2, description: 'Обычный гриб' },
      { name: 'bumazhnyi_kinzhal', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.45, energyCost: 3, description: 'Бумажный кинжал' },
      { name: 'cherep_bez_ponyatia', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.3, energyCost: 6, description: 'cherep_bez_ponyatia для crafting' },
      { name: 'golova_ebazoba', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.4, energyCost: 4, description: 'golova_ebazoba' },
      { name: 'pero_rzhavoi_ptitsy', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.25, energyCost: 5, description: 'pero_rzhavoi_ptitsy_description' },
      { name: 'protknutaya_layshka', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.35, energyCost: 3, description: 'protknutaya_layshka' },
      { name: 'plevok_v_mishen', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.3, energyCost: 4, description: 'plevok_v_mishen' },
      { name: 'sekator', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.55, energyCost: 2, description: 'sekator' },
      { name: 'palka_kopalka', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.4, energyCost: 3, description: 'palka_kopalka' },
      { name: 'bespoleznyi_nabor', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.35, energyCost: 3, description: 'bespoleznyi_nabor' },
      { name: 'klayp', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.3, energyCost: 4, description: 'klayp' },
      { name: 'brakovannyi_gvozd', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.4, energyCost: 5, description: 'brakovannyi_gvozd' },
      { name: 'Смола', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.25, energyCost: 6, description: 'Липкая смола' },
      { name: 'tsvetok_s_kladbist4a', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.35, energyCost: 4, description: 'tsvetok_s_kladbist4a' },
      { name: 'Уголь', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.4, energyCost: 3, description: 'Кусок угля' },
      { name: 'strannoe_ebalo', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.5, energyCost: 2, description: 'strannoe_ebalo' },
      { name: 'nevedomaya_zap4ast', type: 'material', color: 'gray', requiredRank: 1, dropChance: 0.45, energyCost: 3, description: 'nevedomaya_zap4ast' }
    ];

    // Зеленые предметы (20 штук) - улучшенные материалы и простые предметы
    const greenItems = [
      { name: 'Стальной слиток', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.3, energyCost: 8, description: 'Качественный стальной слиток' },
      { name: 'Прочный лук', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 1, statBonus: { attack: 15 }, dropChance: 0.2, energyCost: 10, description: 'Простой но надежный лук' },
      { name: 'Кожаный доспех', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 2, statBonus: { defense: 12, health: 20 }, dropChance: 0.18, energyCost: 12, description: 'Кожаный нагрудник' },
      { name: 'Зелье лечения', type: 'consumable', color: 'green', requiredRank: 2, statBonus: { heal: 100 }, dropChance: 0.25, energyCost: 6, description: 'Восстанавливает 100 здоровья' },
      { name: 'Магическая пыль', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.22, energyCost: 7, description: 'Светящаяся магическая пыль' },
      { name: 'Серебряный амулет', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 3, statBonus: { intelligence: 10 }, dropChance: 0.15, energyCost: 9, description: 'Простой серебряный амулет' },
      { name: 'Обугленное дерево', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.28, energyCost: 6, description: 'Прочное обугленное дерево' },
      { name: 'Ядовитый шип', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.2, energyCost: 8, description: 'Шип с ядом' },
      { name: 'Кристалл маны', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.18, energyCost: 9, description: 'Малый кристалл маны' },
      { name: 'Шелковая нить', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.25, energyCost: 7, description: 'Прочная шелковая нить' },
      { name: 'Медный щит', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 4, statBonus: { defense: 15 }, dropChance: 0.16, energyCost: 11, description: 'Щит из меди' },
      { name: 'Охотничий нож', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 1, statBonus: { attack: 18 }, dropChance: 0.19, energyCost: 10, description: 'Острый охотничий нож' },
      { name: 'Травяной сбор', type: 'consumable', color: 'green', requiredRank: 2, statBonus: { heal: 80 }, dropChance: 0.3, energyCost: 5, description: 'Целебные травы' },
      { name: 'Волшебные чернила', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.2, energyCost: 8, description: 'Чернила для заклинаний' },
      { name: 'Кожаные перчатки', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 5, statBonus: { attack: 5, defense: 8 }, dropChance: 0.22, energyCost: 9, description: 'Укрепленные перчатки' },
      { name: 'Эссенция воздуха', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.15, energyCost: 10, description: 'Концентрированная эссенция воздуха' },
      { name: 'Рунический камень', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.18, energyCost: 9, description: 'Камень с древними рунами' },
      { name: 'Зелье скорости', type: 'consumable', color: 'green', requiredRank: 2, statBonus: { speed: 10 }, dropChance: 0.2, energyCost: 7, description: 'Временно увеличивает скорость' },
      { name: 'Стальные наручи', type: 'upgrade', color: 'green', requiredRank: 2, targetColor: 'gray', targetSlot: 6, statBonus: { defense: 10, strength: 5 }, dropChance: 0.17, energyCost: 11, description: 'Наручи из стали' },
      { name: 'Магический свиток', type: 'material', color: 'green', requiredRank: 2, dropChance: 0.16, energyCost: 10, description: 'Свиток с простыми заклинаниями' }
    ];

    // Функция для создания полного объекта предмета
    const createItem = (itemData, color) => {
      const fileName = itemData.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
      
      return {
        id: uuidv4(),
        name: itemData.name,
        type: itemData.type,
        color: itemData.color,
        requiredRank: itemData.requiredRank,
        targetColor: itemData.targetColor || 'gray',
        targetSlot: itemData.targetSlot || 0,
        statBonus: JSON.stringify(itemData.statBonus || {}),
        dropChance: itemData.dropChance,
        energyCost: itemData.energyCost,
        imageUrl: `/images/items/${color}/${fileName}.png`,
        description: itemData.description,
        isCraftable: itemData.type === 'composite' || itemData.type === 'upgrade',
        compositionLevel: color === 'gray' ? 1 : color === 'green' ? 2 : color === 'blue' ? 3 : color === 'orange' ? 4 : 5,
        craftCost: JSON.stringify({
          gold: itemData.energyCost * 10,
          crystals: 0,
          energy: Math.floor(itemData.energyCost * 0.5)
        }),
        maxStack: itemData.type === 'material' ? 99 : 1,
        inheritsStatsFrom: JSON.stringify([]),
        createdAt: now,
        updatedAt: now
      };
    };

    // Добавляем все предметы в массив
    grayItems.forEach(item => items.push(createItem(item, 'gray')));
    greenItems.forEach(item => items.push(createItem(item, 'green')));
    
    // Добавьте остальные цвета по аналогии...

    await queryInterface.bulkInsert('Items', items, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Items', null, {});
  }
};
