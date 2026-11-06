// Timing da sessão no formato que o Live Data já consome.
// Protocolo público SignalR do livetiming, sem copiar o código da OpenF1.

const TOPICS = ['Heartbeat', 'SessionInfo', 'SessionStatus', 'DriverList', 'TimingData', 'TimingAppData'];

const state = {
  connected: false,
  error: null,
  sessionInfo: null,
  drivers: {},
  lines: {},
  stints: {},
  laps: [],
  updatedAt: null,
};

let socket = null;
let reconnectTimer = null;
let invocation = 1;
let started = false;

function parseLapTime(value) {
  if (value == null || value === '') return null;
  const text = String(value).trim();
  const parts = text.split(':');
  if (parts.length === 2) {
    const seconds = Number(parts[0]) * 60 + Number(parts[1]);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
  }
  const seconds = Number(text);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

function sectorSeconds(sector) {
  const seconds = parseLapTime(sector?.Value);
  return seconds || 0;
}

function merge(target, patch) {
  if (patch == null || typeof patch !== 'object') return patch;
  if (Array.isArray(patch)) {
    const base = Array.isArray(target) ? target.slice() : [];
    patch.forEach((item, index) => {
      base[index] = item && typeof item === 'object' ? merge(base[index], item) : item;
    });
    return base;
  }
  const base = target && typeof target === 'object' && !Array.isArray(target) ? { ...target } : {};
  Object.entries(patch).forEach(([key, value]) => {
    base[key] = value && typeof value === 'object' ? merge(base[key], value) : value;
  });
  return base;
}

function sessionKeys() {
  const info = state.sessionInfo || {};
  const meeting = info.Meeting || {};
  return {
    session_key: Number(info.Key) || 0,
    meeting_key: Number(meeting.Key) || 0,
  };
}

function withOffset(value) {
  if (!value) return null;
  if (/[zZ]$/.test(value) || /[+-]\d\d:\d\d$/.test(value)) return value;
  const offset = String(state.sessionInfo?.GmtOffset || '').slice(0, 6);
  return offset ? `${value}${offset}` : value;
}

function recordLap(driverNumber, lapNumber, duration, sectors, pitOut) {
  if (!duration || lapNumber == null) return;
  const keys = sessionKeys();
  const existing = state.laps.find((lap) => lap.driver_number === driverNumber && lap.lap_number === lapNumber);
  const next = {
    driver_number: driverNumber,
    lap_number: lapNumber,
    lap_duration: duration,
    duration_sector_1: sectorSeconds(sectors?.[0]),
    duration_sector_2: sectorSeconds(sectors?.[1]),
    duration_sector_3: sectorSeconds(sectors?.[2]),
    i1_speed: 0,
    i2_speed: 0,
    st_speed: 0,
    is_pit_out_lap: Boolean(pitOut),
    date_start: new Date().toISOString(),
    session_key: keys.session_key,
    meeting_key: keys.meeting_key,
  };
  if (existing) Object.assign(existing, next);
  else state.laps.push(next);
}

function applyTiming(patch) {
  const lines = patch?.Lines || {};
  Object.entries(lines).forEach(([number, linePatch]) => {
    const driverNumber = Number(number);
    const previous = state.lines[driverNumber] || {};
    const next = merge(previous, linePatch);
    const previousLaps = Number(previous.NumberOfLaps || 0);
    const nextLaps = Number(next.NumberOfLaps || previousLaps);
    if (nextLaps > previousLaps) {
      recordLap(
        driverNumber,
        nextLaps,
        parseLapTime(next.LastLapTime?.Value),
        previous.Sectors?.length ? previous.Sectors : next.Sectors,
        next.PitOut,
      );
    }
    state.lines[driverNumber] = next;
    const shownLap = Number(next.NumberOfLaps || 0);
    const shownTime = parseLapTime(next.LastLapTime?.Value);
    if (shownLap && shownTime && !state.laps.some((lap) => lap.driver_number === driverNumber && lap.lap_number === shownLap)) {
      recordLap(driverNumber, shownLap, shownTime, next.Sectors, next.PitOut);
    }
    const best = parseLapTime(next.BestLapTime?.Value);
    if (best && !state.laps.some((lap) => lap.driver_number === driverNumber && Math.abs(lap.lap_duration - best) < 0.001)) {
      recordLap(driverNumber, 0, best, [], false);
    }
  });
}

function applyStints(patch) {
  const lines = patch?.Lines || patch || {};
  Object.entries(lines).forEach(([number, linePatch]) => {
    if (!linePatch || typeof linePatch !== 'object') return;
    state.stints[Number(number)] = merge(state.stints[Number(number)], linePatch.Stints ? linePatch : { Stints: linePatch.Stints });
  });
}

function resetSession() {
  state.drivers = {};
  state.lines = {};
  state.stints = {};
  state.laps = [];
}

function applyFeed(topic, data) {
  const message = typeof data === 'string' ? JSON.parse(data) : data;
  if (!message || typeof message !== 'object') return;
  if (topic === 'SessionInfo') {
    const nextKey = message.Key;
    if (state.sessionInfo?.Key && nextKey && nextKey !== state.sessionInfo.Key) resetSession();
    state.sessionInfo = merge(state.sessionInfo, message);
  } else if (topic === 'DriverList') {
    state.drivers = merge(state.drivers, message);
  } else if (topic === 'TimingData') {
    applyTiming(message);
  } else if (topic === 'TimingAppData') {
    applyStints(message);
  }
  state.updatedAt = new Date().toISOString();
}

function handleCoreMessage(message) {
  if (!message || typeof message !== 'object') return;
  if (message.type === 6) {
    socket?.send(`${JSON.stringify({ type: 6 })}\x1e`);
    return;
  }
  if (message.type === 1 && message.target === 'feed' && Array.isArray(message.arguments)) {
    const [topic, data] = message.arguments;
    applyFeed(topic, data);
  }
  if (message.type === 3 && message.result && typeof message.result === 'object') {
    Object.entries(message.result).forEach(([topic, data]) => applyFeed(topic, data));
  }
}

function handleFrame(raw) {
  String(raw).split('\x1e').forEach((part) => {
    const text = part.trim();
    if (!text || text === '{}') return;
    try {
      handleCoreMessage(JSON.parse(text));
    } catch (error) {
      state.error = error.message;
    }
  });
}

function subscribe(ws) {
  ws.send(`${JSON.stringify({
    type: 1,
    invocationId: String(invocation),
    target: 'Subscribe',
    arguments: [TOPICS],
  })}\x1e`);
  invocation += 1;
}

async function connect() {
  const token = process.env.F1_TOKEN;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'BestHTTP',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const negotiated = await fetch('https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1', {
    method: 'POST',
    headers,
  });
  if (!negotiated.ok) throw new Error(`Negociação do timing falhou (${negotiated.status})`);
  const cookie = negotiated.headers.getSetCookie?.().map((item) => item.split(';')[0]).join('; ');
  const payload = await negotiated.json();
  const connectionToken = payload.connectionToken || payload.connectionId;
  if (!connectionToken) throw new Error('Timing sem token de conexão');
  const socketUrl = `wss://livetiming.formula1.com/signalrcore?id=${encodeURIComponent(connectionToken)}`;
  await new Promise((resolve, reject) => {
    const ws = new WebSocket(socketUrl, cookie ? { headers: { Cookie: cookie } } : undefined);
    socket = ws;
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve();
    };
    ws.addEventListener('open', () => {
      state.connected = true;
      state.error = null;
      ws.send('{"protocol":"json","version":1}\x1e');
    });
    ws.addEventListener('message', (event) => {
      const raw = String(event.data);
      if (!settled && raw.includes('{}')) {
        subscribe(ws);
        finish();
      }
      handleFrame(raw);
    });
    ws.addEventListener('error', () => finish(new Error('Conexão do timing caiu')));
    ws.addEventListener('close', () => {
      state.connected = false;
      if (socket === ws) socket = null;
      if (!settled) finish(new Error('Timing fechou antes da inscrição'));
      else scheduleReconnect();
    });
    setTimeout(() => finish(new Error('Timing não confirmou a inscrição')), 15000);
  });
}

function scheduleReconnect() {
  if (!started || reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect().catch((error) => {
      state.error = error.message;
      scheduleReconnect();
    });
  }, 3000);
}

function startLiveTiming() {
  if (started) return;
  started = true;
  connect().catch((error) => {
    state.error = error.message;
    scheduleReconnect();
  });
}

function sessionView() {
  const info = state.sessionInfo;
  if (!info) return null;
  const meeting = info.Meeting || {};
  const circuit = meeting.Circuit || {};
  const country = meeting.Country || {};
  const keys = sessionKeys();
  return {
    session_key: keys.session_key,
    session_name: info.Name || info.Type || 'Sessão',
    session_type: info.Type || '',
    date_start: withOffset(info.StartDate) || new Date().toISOString(),
    date_end: withOffset(info.EndDate) || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    gmt_offset: info.GmtOffset || '',
    meeting_key: keys.meeting_key,
    location: meeting.Location || '',
    country_key: Number(country.Key) || 0,
    country_code: country.Code || '',
    country_name: country.Name || '',
    circuit_key: Number(circuit.Key) || 0,
    circuit_short_name: circuit.ShortName || meeting.Location || '',
    year: new Date(info.StartDate || Date.now()).getUTCFullYear(),
  };
}

function driverViews() {
  const keys = sessionKeys();
  return Object.entries(state.drivers).map(([number, driver]) => {
    const driverNumber = Number(driver.RacingNumber || number);
    const name = driver.FullName || driver.BroadcastName || '';
    const [firstName, ...rest] = String(name).split(' ');
    return {
      driver_number: driverNumber,
      broadcast_name: driver.BroadcastName || '',
      full_name: name,
      name_acronym: driver.Tla || '',
      team_name: driver.TeamName || '',
      team_colour: String(driver.TeamColour || '').replace('#', ''),
      first_name: driver.FirstName || firstName || '',
      last_name: driver.LastName || rest.join(' '),
      headshot_url: '',
      country_code: driver.CountryCode || '',
      session_key: keys.session_key,
      meeting_key: keys.meeting_key,
    };
  }).filter((driver) => driver.driver_number);
}

function stintViews() {
  const keys = sessionKeys();
  const rows = [];
  Object.entries(state.stints).forEach(([number, line]) => {
    const stints = line?.Stints || {};
    const ordered = Object.keys(stints).sort((a, b) => Number(a) - Number(b));
    let cursor = 1;
    ordered.forEach((key, index) => {
      const stint = stints[key] || {};
      const laps = Number(stint.TotalLaps || 0);
      const lapStart = cursor;
      const lapEnd = laps > 0 ? cursor + laps - 1 : cursor;
      cursor = lapEnd + 1;
      rows.push({
        compound: String(stint.Compound || '').toUpperCase(),
        driver_number: Number(number),
        lap_start: lapStart,
        lap_end: lapEnd,
        stint_number: index + 1,
        tyre_age_at_start: Number(stint.StartLaps || 0),
        session_key: keys.session_key,
        meeting_key: keys.meeting_key,
      });
    });
  });
  return rows;
}

function positionViews() {
  const keys = sessionKeys();
  const now = new Date().toISOString();
  return Object.entries(state.lines).map(([number, line]) => ({
    driver_number: Number(number),
    position: Number(line.Position) || 0,
    date: now,
    session_key: keys.session_key,
    meeting_key: keys.meeting_key,
  })).filter((item) => item.position > 0);
}

function hasLiveFeed() {
  return Boolean(state.sessionInfo) && (driverViews().length > 0 || state.laps.length > 0);
}

module.exports = {
  startLiveTiming,
  hasLiveFeed,
  liveError: () => state.error,
  liveSession: sessionView,
  liveDrivers: driverViews,
  liveLaps: () => state.laps.map((lap) => ({ ...lap })),
  liveStints: stintViews,
  livePositions: positionViews,
};
