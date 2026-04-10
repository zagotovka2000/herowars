// api/stronghold/defenses.js
import { put, head, del } from '@vercel/blob';

// Имя файла, где будем хранить данные
const BLOB_PATH = 'stronghold-defenses.json';

// Вспомогательная функция: получить текущие данные (или пустой массив, если файла нет)
async function getData() {
  try {
    const { url } = await head(BLOB_PATH);
    if (!url) return []; // файла нет – возвращаем пустой массив
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch blob');
    const data = await response.json();
    return data;
  } catch (error) {
    // Если файл не найден (404), возвращаем пустой массив
    if (error.message.includes('not found')) return [];
    console.error('Error reading blob:', error);
    return [];
  }
}

// Вспомогательная функция: сохранить данные
async function saveData(data) {
  const blob = await put(BLOB_PATH, JSON.stringify(data), {
    access: 'public', // можно 'public' или 'private'
    contentType: 'application/json',
  });
  return blob.url;
}

export default async function handler(req, res) {
  // Устанавливаем CORS заголовки (чтобы ваш React мог обращаться)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: вернуть текущие данные
  if (req.method === 'GET') {
    try {
      const data = await getData();
      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
  }

  // PUT: сохранить новые данные
  if (req.method === 'PUT') {
    try {
      const newData = req.body;
      // Валидация: newData должен быть массивом
      if (!Array.isArray(newData)) {
        return res.status(400).json({ error: 'Invalid data format, expected array' });
      }
      await saveData(newData);
      return res.status(200).json({ message: 'Configuration saved' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
  }

  // Любой другой метод
  res.status(405).json({ error: 'Method not allowed' });
}
