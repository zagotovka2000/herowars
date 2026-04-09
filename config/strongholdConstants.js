const PATRON_LIST = ['Акс', 'Аль', 'Век', 'Каи', 'Мар', 'Мер', 'Оли', 'Хор', 'Фен', 'Бис'];

const ALL_HEROES = [
   'Исм', 'К\'А','Кей','Лир','Три','Цин','Чер','Эль','Ясм',
   'Ара', 'Йор','Лиэ','Пол','ТЗв','Фоб',
   'Айз','Альванор','Ами','Анд','Бир','Крн','Мор','Неб','Себ','Фаф','Фла',
   'Баб','Гус','Дже','Дор','Мрк','Тея','Эйд',
   'Авр','Аст','Гал','Зир','Крв','Лют','Май','Муш','Руф','Тес','Чаб','Эле','Юли',
   'Арт','Дан','Джи','Джу','Кир','ЛаК','Лук','Сор','Фок',
   'Авг','Айр','Без','Кай','Кас','Кри','Лар','Лил','Мод','Ори','Пеп','Сат','Сел','Суд','Фол','Хай','Гел',
];
const HEROES_LIST = ALL_HEROES.filter(hero => !PATRON_LIST.includes(hero));

const TITANS_LIST = [
  'Сол', 'Ияр', 'Риг', 'Амо', 'Тен', 'Бру', 'Мор', 'Кер', 'Сиг', 'Тид', 'Нов', 'Маи', 'Гип',
  'Ара', 'Мол', 'Аше', 'Игн', 'Вул', 'Эде', 'Анг', 'Ава', 'Сил', 'Вер'
];

// ---------- ПОЛНЫЙ СПИСОК УКРЕПЛЕНИЙ (20 штук, как на клиенте) ----------
const FORTS = [
  // Титанские (9)
  { name: 'Мост', type: 'titans', bonus: 'накопление энергии быстрее на ', slots: 6 },
  { name: 'Врата Природы', type: 'titans', bonus: 'снижает урон на ', slots: 4 },
  { name: 'Бастион Льда', type: 'titans', bonus: 'накопление энергии быстрее на ', slots: 4 },
  { name: 'Бастион Огня', type: 'titans', bonus: 'увеличивает здоровье на ', slots: 4 },
  { name: 'Храм Солнца', type: 'titans', bonus: 'снижает урон по защите на ', slots: 4 },
  { name: 'Храм Луны', type: 'titans', bonus: 'увеличивает здоровье на ', slots: 4 },
  { name: 'Источник Стихий', type: 'titans', bonus: 'увеличивает защиту от магии на ', slots: 4 },
  { name: 'Алтарь Жизни', type: 'titans', bonus: 'увеличивает лечение на ', slots: 5 },
  { name: 'Призма Эфира', type: 'titans', bonus: 'увеличивает броню на ', slots: 5 },
  // Геройские (11)
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

const SLOTS_PER_FORT = FORTS.map(f => f.slots);

// Пустой слот (универсальный)
const emptySlot = {
  playerName: '',
  type: 'heroes', // временно, при сохранении будет заменён на правильный тип укрепления
  lineup: {
    pet: null,
    heroes: [null, null, null, null, null],
    titans: [null, null, null, null, null]
  }
};

module.exports = {
  PATRON_LIST,
  HEROES_LIST,
  TITANS_LIST,
  FORTS,
  SLOTS_PER_FORT,
  emptySlot,
};



/* config.json
{
   "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
   },
   "production":{
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
 } */
 