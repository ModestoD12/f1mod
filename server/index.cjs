const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');
const { OAuth2Client } = require('google-auth-library');
const liveTiming = require('./liveTiming.cjs');

const PORT = Number(process.env.PORT) || 3001;
const DB_NAME = process.env.MONGODB_DB || 'eplanner';
const uri = process.env.MONGODB_URI;
const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const TRIAL_DAYS = 30;
const WINDOW_MS = 60 * 60 * 1000;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const COOKIE = 'eplanner_session';
const PREVIEW_COOKIE = 'eplanner_live_preview';
const PREVIEW_MS = 60 * 1000;

function originAllowed(origin) {
  if (!origin) return false;
  if (origin === 'https://f1mod.netlify.app') return true;
  try {
    const url = new URL(origin);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return url.protocol === 'https:' && (local || url.hostname.endsWith('.netlify.app'));
  } catch {
    return false;
  }
}

const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const dummyHash = bcrypt.hashSync('eplanner-dummy-password', 12);
const attempts = new Map();

function limit(bucket, max) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${bucket}:${req.ip}`;
    const recent = (attempts.get(key) || []).filter((time) => now - time < WINDOW_MS);
    if (recent.length >= max) {
      res.status(429).json({ error: 'Muitas tentativas. Tente de novo mais tarde.' });
      return;
    }
    recent.push(now);
    attempts.set(key, recent);
    next();
  };
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function writeSessionCookie(res, token) {
  const maxAge = Math.floor(SESSION_MS / 1000);
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`);
}

function previewKey() {
  return crypto.createHash('sha256').update(String(process.env.MONGODB_URI || 'eplanner-live-preview')).digest();
}

function signPreview(endsAt) {
  const payload = String(endsAt);
  const sig = crypto.createHmac('sha256', previewKey()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function readPreviewEnds(req) {
  const raw = readCookie(req, PREVIEW_COOKIE);
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = crypto.createHmac('sha256', previewKey()).update(payload).digest('base64url');
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;
  const endsAt = Number(payload);
  return Number.isFinite(endsAt) ? endsAt : null;
}

function grantPreview(res) {
  const endsAt = Date.now() + PREVIEW_MS;
  res.append('Set-Cookie', `${PREVIEW_COOKIE}=${signPreview(endsAt)}; HttpOnly; Path=/; SameSite=Lax; Secure`);
  return endsAt;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function trialEnd(from) {
  const date = new Date(from);
  date.setDate(date.getDate() + TRIAL_DAYS);
  return date;
}

function dueDateOf(user, now) {
  const subscription = user.subscription || {};
  const stored = subscription.dueAt || subscription.currentPeriodEndsAt || subscription.trialEndsAt;
  if (stored) return new Date(stored);
  const base = user.createdAt ? new Date(user.createdAt) : now;
  return trialEnd(base);
}

function renewalCategory(dueAt, now) {
  return dueAt.getTime() >= now.getTime() ? 'current' : 'overdue';
}

function readIdentity(body, requireName) {
  if (!body || typeof body !== 'object') return 'Envie os dados da conta.';
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (requireName && (name.length < 2 || name.length > 80)) return 'Informe um nome com pelo menos 2 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return 'Informe um e-mail válido.';
  if (password.length < 8 || password.length > 72) return 'A senha precisa ter entre 8 e 72 caracteres.';
  return { name, email, password };
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    hasPassword: Boolean(user.passwordHash),
    signedInWithGoogle: Boolean(user.googleId),
    subscription: {
      status: user.subscription.status,
      trialEndsAt: user.subscription.trialEndsAt,
      currentPeriodEndsAt: user.subscription.currentPeriodEndsAt,
      dueAt: user.subscription.dueAt,
      renewal: user.subscription.renewal,
    },
    createdAt: user.createdAt,
  };
}

async function createApp() {
  if (!uri) {
    throw new Error('Defina MONGODB_URI');
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 12000 });
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection('users');
  const sessions = db.collection('sessions');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
  await users.createIndex({ 'subscription.renewal': 1, 'subscription.dueAt': 1 });
  await sessions.createIndex({ tokenHash: 1 }, { unique: true });
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  async function openSession(res, userId) {
    const token = crypto.randomBytes(32).toString('base64url');
    await sessions.insertOne({
      tokenHash: hashToken(token),
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_MS),
    });
    writeSessionCookie(res, token);
  }

  async function syncRenewal(user) {
    if (!user) return user;
    const now = new Date();
    const dueAt = dueDateOf(user, now);
    const renewal = renewalCategory(dueAt, now);
    const previousDue = user.subscription && user.subscription.dueAt
      ? new Date(user.subscription.dueAt).getTime()
      : null;
    const previousRenewal = user.subscription && user.subscription.renewal;
    if (previousDue !== dueAt.getTime() || previousRenewal !== renewal) {
      await users.updateOne(
        { _id: user._id },
        { $set: { 'subscription.dueAt': dueAt, 'subscription.renewal': renewal, updatedAt: now } },
      );
    }
    user.subscription = { ...(user.subscription || {}), dueAt, renewal };
    return user;
  }

  async function present(user) {
    return publicUser(await syncRenewal(user));
  }

  async function userFromRequest(req) {
    const token = readCookie(req, COOKIE);
    if (!token) return null;
    const session = await sessions.findOne({
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    });
    if (!session) return null;
    return users.findOne({ _id: session.userId });
  }

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (originAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  async function proxyOpenF1(req, res) {
    const pathName = req.path.replace(/^\/api\/live/, '') || '/';
    const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
    try {
      const response = await fetch(`https://api.openf1.org/v1${pathName}${query}`);
      const body = await response.text();
      res.status(response.status).type('application/json').send(body);
    } catch {
      res.status(502).json({ error: 'Timing indisponível.' });
    }
  }

  function isLocalHostRequest(req) {
    if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') return true;
    const origin = req.headers.origin;
    if (!origin || typeof origin !== 'string') return false;
    try {
      const name = new URL(origin).hostname;
      return name === 'localhost' || name === '127.0.0.1';
    } catch {
      return false;
    }
  }

  function livePreview(req, res) {
    if (isLocalHostRequest(req)) return { allowed: true, endsAt: null };
    const existing = readPreviewEnds(req);
    const endsAt = existing || grantPreview(res);
    return { allowed: Date.now() < endsAt, endsAt };
  }

  async function allowLive(req, res) {
    if (isLocalHostRequest(req)) return true;
    const user = await userFromRequest(req);
    if (user) return true;
    if (livePreview(req, res).allowed) return true;
    res.status(401).json({ error: 'Entre para acompanhar o ao vivo.' });
    return false;
  }

  function liveMatches(req) {
    const current = liveTiming.liveSession();
    if (!liveTiming.hasLiveFeed() || !current) return false;
    const key = req.query.session_key;
    return !key || key === 'latest' || String(key) === String(current.session_key);
  }

  app.get('/api/live/preview', async (req, res) => {
    const user = isLocalHostRequest(req) ? null : await userFromRequest(req);
    if (user) {
      res.json({ allowed: true, endsAt: null });
      return;
    }
    res.json(livePreview(req, res));
  });

  app.get('/api/live/sessions', async (req, res) => {
    if (!(await allowLive(req, res))) return;
    if (liveMatches(req)) {
      res.json([liveTiming.liveSession()]);
      return;
    }
    await proxyOpenF1(req, res);
  });

  app.get('/api/live/drivers', async (req, res) => {
    if (!(await allowLive(req, res))) return;
    if (liveMatches(req)) {
      res.json(liveTiming.liveDrivers());
      return;
    }
    await proxyOpenF1(req, res);
  });

  app.get('/api/live/laps', async (req, res) => {
    if (!(await allowLive(req, res))) return;
    if (liveMatches(req)) {
      res.json(liveTiming.liveLaps());
      return;
    }
    await proxyOpenF1(req, res);
  });

  app.get('/api/live/stints', async (req, res) => {
    if (!(await allowLive(req, res))) return;
    if (liveMatches(req)) {
      res.json(liveTiming.liveStints());
      return;
    }
    await proxyOpenF1(req, res);
  });

  app.get('/api/live/position', async (req, res) => {
    if (!(await allowLive(req, res))) return;
    if (liveMatches(req)) {
      res.json(liveTiming.livePositions());
      return;
    }
    await proxyOpenF1(req, res);
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await db.command({ ping: 1 });
      res.json({ ok: true });
    } catch {
      res.status(503).json({ ok: false });
    }
  });

  app.get('/api/auth/config', (_req, res) => {
    res.json({ googleClientId: googleClientId || null });
  });

  app.get('/api/auth/me', async (req, res) => {
    const user = await userFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Entre para continuar.' });
      return;
    }
    res.json({ user: await present(user) });
  });

  app.post('/api/users', limit('signup', 10), async (req, res) => {
    const signup = readIdentity(req.body, true);
    if (typeof signup === 'string') {
      res.status(400).json({ error: signup });
      return;
    }

    const now = new Date();
    const user = {
      name: signup.name,
      email: signup.email,
      passwordHash: await bcrypt.hash(signup.password, 12),
      googleId: null,
      subscription: {
        status: 'trial',
        trialEndsAt: trialEnd(now),
        currentPeriodEndsAt: null,
        dueAt: trialEnd(now),
        renewal: 'current',
        confirmedAt: null,
      },
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await users.insertOne(user);
      await openSession(res, result.insertedId);
      res.status(201).json({ user: await present({ ...user, _id: result.insertedId }) });
    } catch (error) {
      if (error && error.code === 11000) {
        res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
        return;
      }
      console.error('Falha ao cadastrar usuário');
      res.status(500).json({ error: 'Não foi possível criar a conta.' });
    }
  });

  app.post('/api/auth/login', limit('auth', 20), async (req, res) => {
    const identity = readIdentity({ ...req.body, name: 'Conta' }, false);
    if (typeof identity === 'string') {
      res.status(400).json({ error: identity });
      return;
    }

    const user = await users.findOne({ email: identity.email });
    const hash = user && user.passwordHash ? user.passwordHash : dummyHash;
    const matches = await bcrypt.compare(identity.password, hash);
    if (!user || !user.passwordHash || !matches) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }

    await openSession(res, user._id);
    res.json({ user: await present(user) });
  });

  app.post('/api/auth/google', limit('auth', 20), async (req, res) => {
    if (!googleClient) {
      res.status(503).json({ error: 'Login com Google ainda não está configurado.' });
      return;
    }

    const credential = req.body && typeof req.body.credential === 'string' ? req.body.credential : '';
    if (credential.length < 20) {
      res.status(400).json({ error: 'Token do Google inválido.' });
      return;
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      res.status(401).json({ error: 'Não foi possível confirmar a conta Google.' });
      return;
    }

    const email = payload && typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    const googleId = payload && payload.sub;
    if (!email || !googleId || payload.email_verified === false) {
      res.status(401).json({ error: 'A conta Google precisa de um e-mail verificado.' });
      return;
    }

    const profileName = typeof payload.name === 'string' ? payload.name.trim().replace(/\s+/g, ' ') : '';
    const name = profileName.length >= 2 ? profileName.slice(0, 80) : email.split('@')[0].slice(0, 80);
    const now = new Date();
    let user = await users.findOne({ $or: [{ googleId }, { email }] });

    try {
      if (!user) {
        const created = {
          name,
          email,
          passwordHash: null,
          googleId,
          subscription: {
            status: 'trial',
            trialEndsAt: trialEnd(now),
            currentPeriodEndsAt: null,
            dueAt: trialEnd(now),
            renewal: 'current',
            confirmedAt: null,
          },
          createdAt: now,
          updatedAt: now,
        };
        const result = await users.insertOne(created);
        user = { ...created, _id: result.insertedId };
      } else if (user.googleId && user.googleId !== googleId) {
        res.status(409).json({ error: 'Esse e-mail já está ligado a outra conta Google.' });
        return;
      } else {
        await users.updateOne(
          { _id: user._id },
          { $set: { googleId, updatedAt: now, name: user.name || name } },
        );
        user = await users.findOne({ _id: user._id });
      }
    } catch (error) {
      if (error && error.code === 11000) {
        res.status(409).json({ error: 'Já existe uma conta com esse e-mail.' });
        return;
      }
      console.error('Falha no login com Google');
      res.status(500).json({ error: 'Não foi possível entrar com o Google.' });
      return;
    }

    await openSession(res, user._id);
    res.json({ user: await present(user) });
  });

  app.patch('/api/auth/me', async (req, res) => {
    const user = await userFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Entre para continuar.' });
      return;
    }

    const body = req.body || {};
    const updates = { updatedAt: new Date() };
    if (typeof body.name === 'string') {
      const name = body.name.trim().replace(/\s+/g, ' ');
      if (name.length < 2 || name.length > 80) {
        res.status(400).json({ error: 'Informe um nome com pelo menos 2 caracteres.' });
        return;
      }
      updates.name = name;
    }

    if (typeof body.newPassword === 'string' && body.newPassword.length > 0) {
      if (!user.passwordHash) {
        res.status(400).json({ error: 'Essa conta entra com o Google e não tem senha para trocar.' });
        return;
      }
      const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
      const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!currentOk) {
        res.status(401).json({ error: 'A senha atual está incorreta.' });
        return;
      }
      if (body.newPassword.length < 8 || body.newPassword.length > 72) {
        res.status(400).json({ error: 'A nova senha precisa ter entre 8 e 72 caracteres.' });
        return;
      }
      updates.passwordHash = await bcrypt.hash(body.newPassword, 12);
    }

    if (!updates.name && !updates.passwordHash) {
      res.status(400).json({ error: 'Nada para atualizar.' });
      return;
    }

    await users.updateOne({ _id: user._id }, { $set: updates });
    const next = await users.findOne({ _id: user._id });
    res.json({ user: await present(next) });
  });

  app.post('/api/auth/logout', async (req, res) => {
    const token = readCookie(req, COOKIE);
    if (token) await sessions.deleteOne({ tokenHash: hashToken(token) });
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  return { app, client };
}

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = createApp().then((result) => result.app);
  }
  return appPromise;
}

if (require.main === module) {
  createApp()
    .then(({ app, client }) => {
      liveTiming.startLiveTiming();
      const server = app.listen(PORT, '127.0.0.1', () => {
        console.log(`API de cadastro em http://127.0.0.1:${PORT}`);
      });
      server.on('error', (error) => console.error('HTTP', error.message));

      async function shutdown() {
        server.close();
        await client.close();
        process.exit(0);
      }

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { getApp };
