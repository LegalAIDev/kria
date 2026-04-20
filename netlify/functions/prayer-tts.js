const https = require('https');

const OPENAI_VOICES = new Set(['alloy', 'ash', 'coral', 'echo', 'fable', 'onyx', 'nova', 'sage', 'shimmer']);

function openaiTts(text, voice) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify({
      model: 'tts-1',
      input: text,
      voice,
      response_format: 'mp3',
    }));
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/audio/speech',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`OpenAI TTS error ${res.statusCode}: ${Buffer.concat(chunks).toString()}`));
        } else {
          resolve(Buffer.concat(chunks));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const text = `${body?.text ?? ''}`.trim();
  const rawVoice = `${body?.voice ?? 'nova'}`.toLowerCase();
  const voice = OPENAI_VOICES.has(rawVoice) ? rawVoice : 'nova';

  if (process.env.OPENAI_API_KEY) {
    try {
      const audio = await openaiTts(text, voice);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
        body: audio.toString('base64'),
        isBase64Encoded: true,
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // Fallback: silent WAV when no API key is configured
  const approxSeconds = Math.min(8, Math.max(1.2, text.length / 30));
  const wav = makeSilentWav(approxSeconds);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'audio/wav' },
    body: wav.toString('base64'),
    isBase64Encoded: true,
  };
};
