const http = require('http');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3001;
const YT_DLP = '/usr/local/bin/yt-dlp';
const CACHE_DIR = path.join(os.tmpdir(), 'yt-caption-cache');

fs.mkdirSync(CACHE_DIR, { recursive: true });

// Prevent duplicate yt-dlp processes for the same request
const inFlight = new Map();

function runYtDlp(videoId, lang, isAsr, outBase) {
  return new Promise((resolve) => {
    const args = [
      '--no-warnings',
      '--skip-download',
      '--sub-format', 'json3',
      '--sub-langs', lang,
      isAsr ? '--write-auto-sub' : '--write-sub',
      '-o', outBase,
      `https://www.youtube.com/watch?v=${videoId}`,
    ];
    execFile(YT_DLP, args, { timeout: 30000 }, (err) => {
      if (err) console.error(`[yt-dlp] v=${videoId} ${isAsr ? 'asr' : 'sub'} error:`, err.message.split('\n')[0]);
      resolve();
    });
  });
}

async function getCaptions(videoId, lang, isAsr) {
  const key = `${videoId}_${lang}_${isAsr ? 'asr' : 'sub'}`;

  if (inFlight.has(key)) return inFlight.get(key);

  const outBase = path.join(CACHE_DIR, key);
  const outputFile = `${outBase}.${lang}.json3`;

  const promise = (async () => {
    if (!fs.existsSync(outputFile)) {
      await runYtDlp(videoId, lang, isAsr, outBase);
    }
    if (!fs.existsSync(outputFile)) return {};
    try {
      const data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      console.log(`[timedtext] v=${videoId} lang=${lang} ${isAsr ? 'asr' : 'manual'} → ${(data.events || []).length} events`);
      return data;
    } catch {
      return {};
    }
  })();

  inFlight.set(key, promise);
  promise.finally(() => inFlight.delete(key));
  return promise;
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

  const videoId = url.searchParams.get('v');
  const lang = url.searchParams.get('lang') ?? 'en';
  const kind = url.searchParams.get('kind');

  const sendEmpty = () => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end('{}');
  };

  if (!videoId) return sendEmpty();

  try {
    const data = await getCaptions(videoId, lang, kind === 'asr');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error('Lỗi xử lý:', err.message);
    sendEmpty();
  }

}).listen(PORT, () => {
  console.log(`\n✅ Transcript proxy: http://localhost:${PORT}`);
  console.log('📌 Giữ terminal này mở khi dùng English Buddy\n');
});
