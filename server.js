const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString('utf-8');
      if (body.length > 5_000_000) {
        reject(new Error('Request too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function makeSilentWav(seconds = 1.4, sampleRate = 8000) {
  const channels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.max(1, Math.floor(seconds * sampleRate));
  const dataSize = numSamples * channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

async function handleApi(req, res) {
  if (req.method === 'POST' && req.url === '/api/prayer/tts') {
    const body = await readJsonBody(req);
    const text = `${body?.text ?? ''}`.trim();
    const approxSeconds = Math.min(8, Math.max(1.2, text.length / 30));
    const wav = makeSilentWav(approxSeconds);
    res.writeHead(200, { 'Content-Type': 'audio/wav' });
    res.end(wav);
    return true;
  }

  if (req.method === 'POST' && req.url === '/api/prayer/analyze-reading') {
    const body = await readJsonBody(req);
    const audioLen = `${body?.audioBase64 ?? ''}`.length;
    const score = Math.min(98, Math.max(62, Math.floor(62 + (audioLen % 36))));
    const readyToAdvance = score >= 80;
    sendJson(res, 200, {
      score,
      transcript: "Auto-transcript unavailable in local mock mode.",
      feedback: {
        score,
        strength: {
          chunk: "מוֹדֶה אֲנִי",
          comment: score >= 85
            ? "Strong pacing and clear pronunciation."
            : "Nice effort — your reading flow is improving.",
        },
        areasToWork: readyToAdvance ? [] : [
          {
            hebrew: "בְּחֶמְלָה רַבָּה",
            issue: "Syllables blended together on the second word.",
            tip: "Pause slightly between words and keep stress on the final syllable.",
          },
        ],
        overall: readyToAdvance
          ? "Great reading! You're ready to move on."
          : "Good progress. Practice the highlighted phrase and try again.",
        readyToAdvance,
      },
    });
    return true;
  }

  return false;
}

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.][.][/\\])+/, '');
  const requested = normalized === '/' ? '/index.html' : normalized;
  return path.join(ROOT, requested);
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  handleApi(req, res).then((handled) => {
    if (handled) return;

    const filePath = safeResolve(req.url || '/');

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        sendFile(filePath, res);
        return;
      }

      // SPA fallback for client-side routes (same behavior as netlify.toml)
      sendFile(path.join(ROOT, 'index.html'), res);
    });
  }).catch((err) => {
    sendJson(res, 400, { error: err.message || 'Bad request' });
  });
});

server.listen(PORT, () => {
  console.log(`Kria site running at http://localhost:${PORT}`);
});
