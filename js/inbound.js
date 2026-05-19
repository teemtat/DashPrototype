// ═══════════════════════════════════════════════════════
//  SUNSYSTEM — Inbound Calls Module
// ═══════════════════════════════════════════════════════

// ── Render inbound table ──────────────────────────────
function Inbound_render() {
  const tbody = document.getElementById('inbound-tbody');
  if (!tbody || typeof INBOUND_CALLS === 'undefined') return;

  const connLabel = { connected: 'Connected', noanswer: 'Hung Up', transferred: 'Transferred', busy: 'Busy' };

  tbody.innerHTML = INBOUND_CALLS.calls.map(call => {
    const intentCell = call.intent
      ? `<span class="intent-tag intent-${call.intentCategory}">${call.intent}</span>` : '—';
    const resCell = call.resolution
      ? `<span class="res-tag res-${call.resolution}">${capitalize(call.resolution)}</span>` : '—';
    return `<tr class="inbound-row" data-call-id="${call.id}">
      <td>${call.caller}</td>
      <td>${call.line}</td>
      <td>${call.date}&nbsp;&nbsp;${call.time}</td>
      <td>${call.duration}</td>
      <td><span class="status status-${call.connection}">${connLabel[call.connection] || call.connection}</span></td>
      <td>${intentCell}</td>
      <td>${resCell}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('tr.inbound-row').forEach(row => {
    row.addEventListener('click', () => Inbound_openDrawer(row.dataset.callId));
  });
}

// ── Open call drawer ──────────────────────────────────
function Inbound_openDrawer(id) {
  const call = (typeof INBOUND_CALLS !== 'undefined')
    ? INBOUND_CALLS.calls.find(c => c.id === id) : null;

  if (call) {
    const connLabel = { connected: 'Connected', noanswer: 'Hung Up', transferred: 'Transferred', busy: 'Busy' };

    // Header
    document.getElementById('drawer-caller-title').textContent = call.caller;
    document.getElementById('drawer-sub').innerHTML =
      `${call.line} &nbsp;·&nbsp; ${call.date}, ${call.time} &nbsp;·&nbsp; ${call.duration}`;
    const badge = document.getElementById('drawer-connection-badge');
    badge.textContent = connLabel[call.connection] || call.connection;
    badge.className   = `status status-${call.connection}`;

    // Chat transcript
    const thread = document.getElementById('drawer-chat-thread');
    if (call.transcript && call.transcript.length > 0) {
      thread.innerHTML = call.transcript.map(msg => {
        if (msg.speaker === 'bot') {
          return `<div class="chat-msg bot">
            <div class="chat-avatar bot-avatar">🤖</div>
            <div class="chat-bubble-wrap">
              <div class="chat-name">aunjai <span class="chat-time">${msg.time}</span></div>
              <div class="chat-bubble bot-bubble">${msg.text}</div>
            </div>
          </div>`;
        } else {
          return `<div class="chat-msg customer">
            <div class="chat-bubble-wrap">
              <div class="chat-name">Customer <span class="chat-time">${msg.time}</span></div>
              <div class="chat-bubble customer-bubble">${msg.text}</div>
            </div>
            <div class="chat-avatar customer-avatar">👤</div>
          </div>`;
        }
      }).join('');
    } else {
      thread.innerHTML = `<div style="text-align:center;color:#b0b0b0;font-size:13px;padding:40px 0;">No conversation — call was not answered.</div>`;
    }

    // End note
    const endNote = document.getElementById('drawer-chat-end-note');
    if (call.intent) {
      endNote.innerHTML = `🏁 Call ended — Final Intent: <strong>${call.intent}</strong> · Resolution: <strong>${capitalize(call.resolution)}</strong>`;
      endNote.style.display = '';
    } else {
      endNote.style.display = 'none';
    }

    // Detail panel
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('drawer-detail-caller',   call.caller);
    set('drawer-detail-line',     call.line);
    set('drawer-detail-datetime', `${call.date}, ${call.time}`);
    set('drawer-detail-duration', call.duration);

    document.getElementById('drawer-detail-connection').innerHTML =
      `<span class="status status-${call.connection}">${connLabel[call.connection] || call.connection}</span>`;

    const intentEl    = document.getElementById('drawer-detail-intent');
    const intentSubEl = document.getElementById('drawer-detail-intent-sub');
    if (call.intent) {
      intentEl.innerHTML      = `<span class="intent-tag intent-${call.intentCategory}">${call.intent}</span>`;
      intentSubEl.textContent = call.intentLabel;
      intentSubEl.style.display = '';
    } else {
      intentEl.textContent      = '—';
      intentSubEl.style.display = 'none';
    }

    const resEl    = document.getElementById('drawer-detail-resolution');
    const resSubEl = document.getElementById('drawer-detail-resolution-sub');
    if (call.resolution) {
      resEl.innerHTML      = `<span class="res-tag res-${call.resolution}">${capitalize(call.resolution)}</span>`;
      resSubEl.textContent = call.resolutionLabel;
      resSubEl.style.display = '';
    } else {
      resEl.textContent      = '—';
      resSubEl.style.display = 'none';
    }

    const taskEl    = document.getElementById('drawer-detail-linked-task');
    const taskSubEl = document.getElementById('drawer-detail-linked-sub');
    if (call.linkedTask) {
      taskEl.textContent    = call.linkedTaskName;
      taskEl.style.color    = '#00a651';
      taskEl.style.cursor   = 'pointer';
      taskSubEl.textContent = call.linkedTask;
    } else {
      taskEl.textContent    = '—';
      taskEl.style.color    = '';
      taskEl.style.cursor   = '';
      taskSubEl.textContent = '';
    }

    // Wire download buttons with this call's data
    Inbound_wireDownloadButtons(call);

    // Init audio player with this call's duration
    const hasRecording = call.connection === 'connected' || call.connection === 'transferred';
    const playerEl = document.getElementById('drawer-audio-player');
    if (playerEl) {
      if (hasRecording && call.duration && call.duration !== '—') {
        playerEl.style.display = '';
        AudioPlayer_init(call.duration);
      } else {
        playerEl.style.display = 'none'; // no recording for unanswered calls
      }
    }
  }

  document.getElementById('callDrawer').classList.add('open');
  document.getElementById('drawerBackdrop').classList.add('open');
}

function Inbound_closeDrawer() {
  AudioPlayer_stop(); // stop playback when drawer closes
  document.getElementById('callDrawer').classList.remove('open');
  document.getElementById('drawerBackdrop').classList.remove('open');
}

// ── Download: Transcript (.txt) ───────────────────────
function Inbound_downloadTranscript(call) {
  if (!call || !call.transcript || call.transcript.length === 0) {
    Inbound_showToast('No transcript available for this call.', 'warn');
    return;
  }

  const lines = [
    'SunSystem — AI Call Transcript',
    '═'.repeat(40),
    `Caller      : ${call.caller}`,
    `Client Line : ${call.line}`,
    `Date & Time : ${call.date}, ${call.time}`,
    `Duration    : ${call.duration}`,
    `Connection  : ${call.connection}`,
    `Final Intent: ${call.intent || '—'}`,
    `Resolution  : ${call.resolution || '—'}`,
    '═'.repeat(40),
    '',
    '--- Conversation ---',
    ''
  ];

  call.transcript.forEach(msg => {
    const speaker = msg.speaker === 'bot' ? 'aunjai (AI)' : 'Customer';
    lines.push(`[${msg.time}] ${speaker}:`);
    lines.push(`  ${msg.text}`);
    lines.push('');
  });

  lines.push('--- End of Transcript ---');
  lines.push(`Generated: ${new Date().toLocaleString('en-GB')}`);

  const content  = lines.join('\n');
  const blob     = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `transcript_${call.caller.replace(/\s+/g, '_')}_${call.date.replace(/\s/g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  Inbound_showToast('Transcript downloaded.');
}

// ── Download: MP3 (mockup) ────────────────────────────
function Inbound_downloadMP3(call) {
  Inbound_showToast('Preparing audio file… (mockup)', 'info');
  // In production this would fetch the actual audio file from the server.
  setTimeout(() => {
    Inbound_showToast('Audio download would start here in production.', 'info');
  }, 1200);
}

// ── Wire buttons to current call ─────────────────────
function Inbound_wireDownloadButtons(call) {
  const btnMp3 = document.getElementById('drawer-btn-mp3');
  const btnTxt = document.getElementById('drawer-btn-transcript');
  if (btnMp3) btnMp3.onclick = () => Inbound_downloadMP3(call);
  if (btnTxt) btnTxt.onclick = () => Inbound_downloadTranscript(call);
}

// ── Audio Player ──────────────────────────────────────
const AudioPlayer = {
  totalSeconds: 0,
  currentSeconds: 0,
  playing: false,
  timer: null,
  bars: 44   // number of waveform bars
};

function AudioPlayer_init(durationStr) {
  // Stop any existing playback
  AudioPlayer_stop();

  // Parse duration string e.g. "2m 14s" or "1m 37s" or "38s"
  let total = 0;
  const mMatch = durationStr && durationStr.match(/(\d+)m/);
  const sMatch = durationStr && durationStr.match(/(\d+)s/);
  if (mMatch) total += parseInt(mMatch[1]) * 60;
  if (sMatch) total += parseInt(sMatch[1]);
  if (!total) total = 90; // fallback 1m 30s

  AudioPlayer.totalSeconds   = total;
  AudioPlayer.currentSeconds = 0;
  AudioPlayer.playing        = false;

  // Set total time label
  document.getElementById('audio-total').textContent   = AudioPlayer_formatTime(total);
  document.getElementById('audio-current').textContent = '0:00';
  document.getElementById('audio-progress-fill').style.width = '0%';
  document.getElementById('audio-play-btn').textContent = '▶';

  // Generate waveform bars (random heights, seeded by duration so same call = same shape)
  AudioPlayer_renderWaveform(total);
}

function AudioPlayer_renderWaveform(seed) {
  const container = document.getElementById('drawer-waveform');
  if (!container) return;
  // Simple deterministic pseudo-random based on seed
  let s = seed;
  function rand() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }

  container.innerHTML = '';
  for (let i = 0; i < AudioPlayer.bars; i++) {
    const h = Math.floor(rand() * 26 + 6); // 6–32px
    const bar = document.createElement('div');
    bar.className = 'audio-wave-bar';
    bar.style.height = h + 'px';
    bar.dataset.index = i;
    container.appendChild(bar);
  }

  // Click on waveform to seek
  container.onclick = (e) => {
    const rect = container.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    AudioPlayer_seekTo(pct);
  };
}

function AudioPlayer_toggle() {
  if (AudioPlayer.playing) {
    AudioPlayer_pause();
  } else {
    AudioPlayer_play();
  }
}

function AudioPlayer_play() {
  if (AudioPlayer.currentSeconds >= AudioPlayer.totalSeconds) {
    AudioPlayer.currentSeconds = 0; // restart
  }
  AudioPlayer.playing = true;
  document.getElementById('audio-play-btn').textContent = '⏸';
  AudioPlayer.timer = setInterval(() => {
    AudioPlayer.currentSeconds++;
    if (AudioPlayer.currentSeconds >= AudioPlayer.totalSeconds) {
      AudioPlayer.currentSeconds = AudioPlayer.totalSeconds;
      AudioPlayer_pause();
      document.getElementById('audio-play-btn').textContent = '▶';
    }
    AudioPlayer_updateUI();
  }, 1000);
}

function AudioPlayer_pause() {
  AudioPlayer.playing = false;
  clearInterval(AudioPlayer.timer);
  AudioPlayer.timer = null;
  document.getElementById('audio-play-btn').textContent = '▶';
}

function AudioPlayer_stop() {
  clearInterval(AudioPlayer.timer);
  AudioPlayer.timer   = null;
  AudioPlayer.playing = false;
}

function AudioPlayer_seek(e, bar) {
  const rect = bar.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  AudioPlayer_seekTo(pct);
}

function AudioPlayer_seekTo(pct) {
  AudioPlayer.currentSeconds = Math.floor(pct * AudioPlayer.totalSeconds);
  AudioPlayer_updateUI();
  if (!AudioPlayer.playing) AudioPlayer_play();
}

function AudioPlayer_updateUI() {
  const pct = AudioPlayer.totalSeconds > 0
    ? (AudioPlayer.currentSeconds / AudioPlayer.totalSeconds) * 100 : 0;

  document.getElementById('audio-progress-fill').style.width = pct + '%';
  document.getElementById('audio-current').textContent = AudioPlayer_formatTime(AudioPlayer.currentSeconds);

  // Update waveform bar colours
  const bars     = document.querySelectorAll('#drawer-waveform .audio-wave-bar');
  const playedAt = Math.floor((pct / 100) * AudioPlayer.bars);
  bars.forEach((bar, i) => {
    bar.classList.toggle('played',  i < playedAt);
    bar.classList.toggle('current', i === playedAt);
  });
}

function AudioPlayer_formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Toast notification ────────────────────────────────
function Inbound_showToast(message, type = 'success') {
  const existing = document.getElementById('inbound-toast');
  if (existing) existing.remove();

  const colors = {
    success: { bg: '#f0faf5', border: '#b8e6cf', color: '#00a651' },
    warn:    { bg: '#fff8f0', border: '#ffe0cc', color: '#e65100' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' }
  };
  const c = colors[type] || colors.success;

  const toast = document.createElement('div');
  toast.id = 'inbound-toast';
  toast.style.cssText = `
    position: fixed; bottom: 28px; right: 28px; z-index: 9999;
    background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.color};
    padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08); animation: slideUp 0.2s ease;
    max-width: 320px;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
