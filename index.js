// index.js – Cloudflare Worker для JSON API
export default {
   async fetch(request, env, ctx) {
     const url = new URL(request.url);
     const path = url.pathname;
 
     // Общие CORS-заголовки для всех ответов
     const corsHeaders = {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
       'Content-Type': 'application/json'
     };
 
     // Ответ на preflight (OPTIONS) – нужен для CORS
     if (request.method === 'OPTIONS') {
       return new Response(null, { headers: corsHeaders });
     }
 
     // 1. Тестовый эндпоинт
     if (path === '/api/stronghold/test' && request.method === 'GET') {
       const data = { status: 'ok', message: 'Server works!' };
       return new Response(JSON.stringify(data), { headers: corsHeaders });
     }
 
     // 2. Заглушка для defenses
     if (path === '/api/stronghold/defenses' && request.method === 'GET') {
       return new Response(JSON.stringify([]), { headers: corsHeaders });
     }
 
     // 3. Любой другой /api/stronghold/*
     if (path.startsWith('/api/stronghold/')) {
       const error = { error: 'Not found' };
       return new Response(JSON.stringify(error), {
         status: 404,
         headers: corsHeaders
       });
     }
 
     // 4. Всё, что не начинается с /api/stronghold – тоже 404
     const error = { error: 'Not found' };
     return new Response(JSON.stringify(error), {
       status: 404,
       headers: corsHeaders
     });
   }
 };
