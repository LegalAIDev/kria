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

  const audioLen = `${body?.audioBase64 ?? ''}`.length;
  const score = Math.min(98, Math.max(62, Math.floor(62 + (audioLen % 36))));
  const readyToAdvance = score >= 80;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      score,
      transcript: 'Auto-transcript unavailable in mock mode.',
      feedback: {
        score,
        strength: {
          chunk: 'מוֹדֶה אֲנִי',
          comment: score >= 85
            ? 'Strong pacing and clear pronunciation.'
            : 'Nice effort — your reading flow is improving.',
        },
        areasToWork: readyToAdvance ? [] : [
          {
            hebrew: 'בְּחֶמְלָה רַבָּה',
            issue: 'Syllables blended together on the second word.',
            tip: 'Pause slightly between words and keep stress on the final syllable.',
          },
        ],
        overall: readyToAdvance
          ? "Great reading! You're ready to move on."
          : 'Good progress. Practice the highlighted phrase and try again.',
        readyToAdvance,
      },
    }),
  };
};
