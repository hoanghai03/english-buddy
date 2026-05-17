const https = require('https');
const http = require('http');

const PORT = 3001;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': '*/*',
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchYouTube(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        https.get(url, { headers: HEADERS }, (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve({ status: res.statusCode, body: body || '{}' }));
        }).on('error', reject);
      });

      if (result.status === 429 && attempt < retries) {
        console.warn(`YouTube 429, thử lại sau ${attempt}s... (lần ${attempt}/${retries})`);
        await delay(1000 * attempt);
        continue;
      }

      return result;
    } catch (err) {
      console.error('Lỗi fetch YouTube:', err.message);
      if (attempt === retries) return { status: 500, body: '{}' };
      await delay(500 * attempt);
    }
  }
  return { status: 500, body: '{}' };
}

http.createServer(async (req, res) => {
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
  const { status, body } = await fetchYouTube(ytUrl);

  // Trả về 200 kể cả khi YouTube 429 (để Angular không throw error, chỉ nhận {} trống)
  const finalStatus = status === 429 ? 200 : (status || 200);
  res.writeHead(finalStatus, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);

}).listen(PORT, () => {
  console.log(`\n✅ Transcript proxy: http://localhost:${PORT}`);
  console.log('📌 Giữ terminal này mở khi dùng English Buddy\n');
});
