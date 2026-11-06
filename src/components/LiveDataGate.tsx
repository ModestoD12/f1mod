import { useEffect, useState, type ReactNode } from 'react';
import { renderGoogleButton } from '../services/googleSignIn';
import './account-menu.css';
import './live-timing.css';

const builtClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const validClientId = builtClientId.endsWith('.apps.googleusercontent.com') ? builtClientId : '';

function isLocalHost() {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

async function request(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível continuar.');
  return data;
}

function LiveLogin({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [googleClientId, setGoogleClientId] = useState(validClientId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth/config', { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((config) => {
        const fromApi = config?.googleClientId;
        if (typeof fromApi === 'string' && fromApi.endsWith('.apps.googleusercontent.com')) {
          setGoogleClientId(fromApi);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!googleClientId) return undefined;
    let cancelled = false;
    let detach = () => {};
    const frame = window.requestAnimationFrame(() => {
      const parent = document.getElementById('google-signin-live');
      if (!parent) return;
      renderGoogleButton(parent, googleClientId, {
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        context: mode === 'signup' ? 'signup' : 'signin',
        width: 288,
        onCredential: async (credential) => {
          setBusy(true);
          setError('');
          try {
            await request('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential }),
            });
            onSuccess();
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Não foi possível entrar com o Google.');
          } finally {
            setBusy(false);
          }
        },
      }).then((remove) => {
        detach = remove;
        if (cancelled) remove();
      }).catch(() => {
        if (!cancelled) setError('Não foi possível carregar o login do Google.');
      });
    });
    return () => {
      cancelled = true;
      detach();
      window.cancelAnimationFrame(frame);
    };
  }, [googleClientId, mode, onSuccess]);

  async function submitAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') {
        await request('/api/users', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      } else {
        await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      }
      onSuccess();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível continuar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="live-timing">
      <div className="live-timing__login">
        <p className="prndl-kicker">Fórmula 1</p>
        <h2>{mode === 'signup' ? 'Criar conta' : 'Entrar'}</h2>
        <p className="live-timing__meta">O minuto de amostra terminou. Entre para continuar. O primeiro mês é grátis.</p>
        <div className="account-menu__google" id="google-signin-live" />
        <div className="account-menu__divider">ou</div>
        <form className="account-menu__form" onSubmit={submitAccount}>
          {mode === 'signup' ? (
            <label>
              Nome
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Seu nome" />
            </label>
          ) : null}
          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@email.com" required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="Sua senha" required />
          </label>
          {error ? <p className="account-menu__error">{error}</p> : null}
          <button className="account-menu__submit" type="submit" disabled={busy}>
            {mode === 'signup' ? 'Criar conta' : 'Entrar'}
          </button>
        </form>
        <button
          type="button"
          className="account-menu__switch"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'Criar uma conta' : 'Já tenho conta'}
        </button>
        <p className="account-menu__legal">
          Ao entrar, o Sportcenter recebe só nome e e-mail para criar a conta.
          Leia os <a href="/termos.html">Termos</a> e a <a href="/privacidade.html">Política de privacidade</a>.
        </p>
      </div>
    </section>
  );
}

function PreviewNote({ endsAt }: { endsAt: number }) {
  const [left, setLeft] = useState(() => Math.max(0, endsAt - Date.now()));

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, endsAt - Date.now()));
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const seconds = Math.ceil(left / 1000);
  const label = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return <p className="live-timing__preview">Amostra gratuita · {label}</p>;
}

export function LiveDataGate({ children }: { children: ReactNode }) {
  const local = isLocalHost();
  const [phase, setPhase] = useState<'checking' | 'open' | 'login'>(local ? 'open' : 'checking');
  const [endsAt, setEndsAt] = useState<number | null>(null);

  useEffect(() => {
    if (local) {
      setPhase('open');
      setEndsAt(null);
      return undefined;
    }
    let cancelled = false;
    let generation = 0;
    let timer = 0;

    const load = () => {
      const current = ++generation;
      window.clearTimeout(timer);
      fetch('/api/auth/me', { credentials: 'include' })
        .then(async (response) => (response.ok ? response.json() : null))
        .then(async (data) => {
          if (cancelled || current !== generation) return;
          if (data?.user) {
            setEndsAt(null);
            setPhase('open');
            return;
          }
          const previewResponse = await fetch('/api/live/preview', { credentials: 'include' });
          const preview = await previewResponse.json().catch(() => ({}));
          if (cancelled || current !== generation) return;
          const end = Number(preview.endsAt);
          if (preview.allowed && Number.isFinite(end) && end > Date.now()) {
            setEndsAt(end);
            setPhase('open');
            timer = window.setTimeout(() => {
              if (!cancelled && current === generation) setPhase('login');
            }, end - Date.now());
            return;
          }
          setEndsAt(null);
          setPhase('login');
        })
        .catch(() => {
          if (!cancelled && current === generation) setPhase('login');
        });
    };

    load();
    window.addEventListener('f1mod-auth', load);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('f1mod-auth', load);
    };
  }, [local]);

  if (phase === 'checking') {
    return (
      <section className="live-timing">
        <p className="live-timing__loading">Carregando telemetria</p>
      </section>
    );
  }

  if (phase === 'open') {
    return (
      <>
        {endsAt ? <PreviewNote endsAt={endsAt} /> : null}
        {children}
      </>
    );
  }

  return (
    <LiveLogin
      onSuccess={() => {
        setEndsAt(null);
        setPhase('open');
        window.dispatchEvent(new Event('f1mod-auth'));
      }}
    />
  );
}
