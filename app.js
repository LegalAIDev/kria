const state = {
  view: "home",
  xp: 2840,
  energy: 70,
  streak: 14,
  hintsLeft: 3,
  speedTap: {
    chunk: 'בָּרוּךְ אַתָּה יְיָ',
    translit: 'ba-ruch a-tah a-do-nai',
    fill: 0,
    running: false,
    pausedUntil: 0,
    stars: 0,
    message: 'Tap when your confidence feels high.',
  },
  boss: {
    score: null,
    loading: false,
    report: null,
  },
  prayers: [
    { id: 1, name: 'Modeh Ani', status: 'Gold' },
    { id: 2, name: 'Asher Yatzar', status: 'Unit 3/5' },
    { id: 3, name: 'Elohai Neshama', status: 'Locked' },
    { id: 4, name: 'Birkot HaShachar', status: 'Locked' },
    { id: 5, name: 'Barchu', status: 'Locked' },
  ],
};

const tabDefs = [
  ["home", "Home / Progress"],
  ["listen", "Listen & Follow"],
  ["speed", "Speed Tap"],
  ["boss", "Boss Round"],
  ["report", "Feedback Report"],
];

const tabs = document.getElementById("tabs");
const view = document.getElementById("view");
const xpValue = document.getElementById("xpValue");
const energyValue = document.getElementById("energyValue");

function updateHeader() {
  xpValue.textContent = `${state.xp.toLocaleString()} XP`;
  energyValue.textContent = `Energy ${state.energy}%`;
}

function renderTabs() {
  tabs.innerHTML = tabDefs
    .map(
      ([id, label]) =>
        `<button class="${state.view === id ? "active" : ""}" data-tab="${id}">${label}</button>`
    )
    .join("");

  tabs.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.tab;
      render();
    });
  });
}

function renderHome() {
  return `
    <section class="grid-2">
      <article class="card">
        <h2>Good morning, Avi</h2>
        <p><strong>Current title:</strong> Dalet Decoder</p>
        <p><strong>Next title:</strong> Hey Hero @ 6,000 XP</p>
        <p><strong>Streak:</strong> ${state.streak} days</p>
        <p><strong>Hints trend:</strong> 1 this week vs 3 last week</p>
      </article>
      <article class="card">
        <h2>Fluency Snapshot</h2>
        <p>Modeh Ani: <strong>92</strong> (+4)</p>
        <p>Asher Yatzar: <strong>71</strong> (+6)</p>
        <p>Elohai Neshama: <strong>Not attempted</strong></p>
        <p class="muted">Parent section uses this same screen (no separate login).</p>
      </article>
    </section>

    <article class="card">
      <h2>Prayer Map</h2>
      <div class="prayer-list">
        ${state.prayers
          .map(
            (p) => `<div class="prayer-item"><span>${p.id}. ${p.name}</span><strong>${p.status}</strong></div>`
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderListen() {
  return `
    <article class="card">
      <h2>Listen & Follow</h2>
      <p class="muted">Chunk highlights and audio controls mirror the wireframe/spec flow.</p>
      <div class="chunk-card">
        <div class="hebrew">מוֹדֶה אֲנִי לְפָנֶיךָ</div>
        <p><strong>Transliteration:</strong> mo-deh a-ni le-fa-ne-cha</p>
        <div class="controls">
          <button class="action" id="play75">Play 0.75x</button>
          <button class="action alt" id="play100">Play 1.0x</button>
          <button class="action gold" id="play125">Play 1.25x</button>
        </div>
      </div>
    </article>
  `;
}

function renderSpeed() {
  const stars = '★'.repeat(state.speedTap.stars) + '☆'.repeat(3 - state.speedTap.stars);
  return `
    <article class="card">
      <h2>Speed Tap</h2>
      <p class="muted">Positive fill bar, no red states. Hint pauses bar for 2 seconds.</p>
      <div class="chunk-card">
        <div class="hebrew" id="speedChunk">${state.speedTap.chunk}</div>
        <p id="translit" style="display:none"><strong>${state.speedTap.translit}</strong></p>
        <div class="confidence-wrap"><div class="confidence-fill" id="confidenceFill" style="width:${state.speedTap.fill}%"></div></div>
        <p class="stars">${stars}</p>
        <p id="speedMessage" class="${state.speedTap.stars >= 2 ? 'feedback-good' : 'feedback-warn'}">${state.speedTap.message}</p>
      </div>
      <div class="controls">
        <button class="action" id="startSpeed">Start Round</button>
        <button class="action alt" id="tapNow">Tap Now</button>
        <button class="action gold" id="useHint">Hint (${state.hintsLeft} left)</button>
      </div>
    </article>
  `;
}

function renderBoss() {
  const loading = state.boss.loading
    ? `<p>Warm up while the Rabbi listens… analyzing recording in background.</p>`
    : "";
  return `
    <article class="card">
      <h2>Boss Round</h2>
      <p>Record, quality-check, submit, and receive supportive AI feedback.</p>
      <div class="controls">
        <button class="action" id="recordBtn">Record</button>
        <button class="action alt" id="submitBtn">Submit</button>
      </div>
      ${loading}
      ${state.boss.score !== null ? `<p><strong>Last score:</strong> ${state.boss.score}</p>` : ''}
    </article>
  `;
}

function renderReport() {
  const report = state.boss.report;
  if (!report) {
    return `<article class="card report"><h2>Feedback Report</h2><p>No report yet. Complete a Boss Round submission.</p></article>`;
  }
  return `
    <article class="card report">
      <h2>Feedback Report</h2>
      <p><strong>Overall score:</strong> ${report.score} (${report.delta})</p>
      <p><strong>Top strength:</strong> ${report.strength}</p>
      <h3>Areas to work on</h3>
      <ul>${report.areas.map((a) => `<li>${a}</li>`).join('')}</ul>
      <p><strong>Hint usage:</strong> ${report.hints}</p>
      <p><strong>Recommendation:</strong> ${report.recommendation}</p>
    </article>
  `;
}

function bindViewEvents() {
  if (state.view === 'listen') {
    ['play75', 'play100', 'play125'].forEach((id) => {
      const el = document.getElementById(id);
      el?.addEventListener('click', () => alert('Prototype: Audio playback is stubbed in this build.'));
    });
  }

  if (state.view === 'speed') {
    document.getElementById('startSpeed')?.addEventListener('click', startSpeedRound);
    document.getElementById('tapNow')?.addEventListener('click', finalizeSpeedTap);
    document.getElementById('useHint')?.addEventListener('click', useHint);
  }

  if (state.view === 'boss') {
    document.getElementById('recordBtn')?.addEventListener('click', () => {
      alert('Prototype: MediaRecorder permission + recording flow placeholder.');
    });

    document.getElementById('submitBtn')?.addEventListener('click', async () => {
      state.boss.loading = true;
      render();
      await new Promise((r) => setTimeout(r, 1500));
      const score = Math.min(98, 62 + Math.floor(Math.random() * 30));
      const delta = `+${Math.floor(Math.random() * 9)}`;
      state.boss.score = score;
      state.boss.loading = false;
      state.boss.report = {
        score,
        delta,
        strength: 'Strong pacing in "מוֹדֶה אֲנִי" with clear syllable boundaries.',
        areas: [
          'In "לְפָנֶיךָ", stretch the final kamatz slightly longer.',
          'Avoid blending the first two syllables in the second chunk.',
        ],
        hints: `${3 - state.hintsLeft} used this attempt (${state.hintsLeft} remaining).`,
        recommendation: score >= 60 ? 'You may advance, or replay Speed Tap for extra confidence.' : 'Return to Chunk Flash for focused practice.',
      };
      state.xp += Math.max(20, Math.round(score / 2));
      state.energy = Math.min(100, state.energy + (score >= 60 ? 20 : 5));
      render();
    });
  }
}

let speedTimer;
function startSpeedRound() {
  clearInterval(speedTimer);
  state.speedTap.running = true;
  state.speedTap.fill = 0;
  state.speedTap.stars = 0;
  state.speedTap.message = 'Bar is filling. Tap at the confidence peak.';
  render();

  speedTimer = setInterval(() => {
    if (!state.speedTap.running) return;
    if (Date.now() < state.speedTap.pausedUntil) return;

    state.speedTap.fill += 1.4;
    const fillEl = document.getElementById('confidenceFill');
    if (fillEl) fillEl.style.width = `${Math.min(state.speedTap.fill, 100)}%`;

    if (state.speedTap.fill >= 100) {
      state.speedTap.fill = 0;
      state.speedTap.message = 'Soft reset—try again. No penalty.';
      const msg = document.getElementById('speedMessage');
      if (msg) msg.textContent = state.speedTap.message;
    }
  }, 70);
}

function finalizeSpeedTap() {
  if (!state.speedTap.running) return;
  const pct = state.speedTap.fill;
  const stars = pct > 85 ? 3 : pct > 50 ? 2 : 1;
  state.speedTap.stars = stars;
  state.speedTap.message = stars >= 2 ? 'Great timing. Confidence + fluency both improving.' : 'Nice effort. Replay and wait a little longer for 2–3 stars.';
  state.xp += stars * 10;
  state.energy = Math.max(0, state.energy - 5 + stars * 4);
  render();
}

function useHint() {
  if (state.hintsLeft <= 0) return;
  state.hintsLeft -= 1;
  state.speedTap.pausedUntil = Date.now() + 2000;
  const t = document.getElementById('translit');
  if (t) t.style.display = 'block';
  setTimeout(() => {
    const t2 = document.getElementById('translit');
    if (t2) t2.style.display = 'none';
  }, 2200);
  render();
}

function render() {
  updateHeader();
  renderTabs();

  if (state.view === 'home') view.innerHTML = renderHome();
  if (state.view === 'listen') view.innerHTML = renderListen();
  if (state.view === 'speed') view.innerHTML = renderSpeed();
  if (state.view === 'boss') view.innerHTML = renderBoss();
  if (state.view === 'report') view.innerHTML = renderReport();

  bindViewEvents();
}

render();
