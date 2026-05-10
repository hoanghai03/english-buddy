const https = require('https');
const http = require('http');

const PORT = 3001;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (!url.pathname.startsWith('/api/timedtext')) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ytUrl = `https://www.youtube.com/api/timedtext?${url.searchParams.toString()}`;

  https.get(ytUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': '*/*',
    }
  }, (ytRes) => {
    let body = '';
    ytRes.on('data', chunk => body += chunk);
    ytRes.on('end', () => {
      res.writeHead(ytRes.statusCode || 200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(body || '{}');
    });
  }).on('error', (err) => {
    console.error('Lỗi fetch YouTube:', err.message);
    res.writeHead(500);
    res.end('{}');
  });

}).listen(PORT, () => {
  console.log(`\n✅ Transcript proxy: http://localhost:${PORT}`);
  console.log('📌 Giữ terminal này mở khi dùng English Buddy\n');
});
