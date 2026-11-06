import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { renderGoogleButton } from '../services/googleSignIn';
import './account-menu.css';

type AccountUser = {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  signedInWithGoogle: boolean;
  subscription: {
    status: 'trial' | 'active' | 'canceled';
    trialEndsAt: string | null;
    currentPeriodEndsAt: string | null;
    dueAt: string | null;
    renewal: 'current' | 'overdue';
  };
};

const builtClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const validClientId = builtClientId.endsWith('.apps.googleusercontent.com') ? builtClientId : '';

const PLAN_LABEL = {
  trial: 'Mês grátis',
  active: 'Assinatura ativa',
  canceled: 'Assinatura cancelada',
};

const RENEWAL_MESSAGE = {
  current: 'aproveite acompanhe tudo!',
  overdue: 'vamos renovar sua mensalidade? ;)',
};

function formatDay(value: string | null) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('pt-BR');
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

export function AccountMenu() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(validClientId || null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(async (response) => (response.ok ? response.json() : null)),
      fetch('/api/auth/config', { credentials: 'include' }).then(async (response) => (response.ok ? response.json() : null)),
    ]).then(([session, config]) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        setName(session.user.name);
      }
      const fromApi = config?.googleClientId;
      const nextId = typeof fromApi === 'string' && fromApi.endsWith('.apps.googleusercontent.com')
        ? fromApi
        : validClientId;
      setGoogleClientId(nextId || null);
    }).catch(() => {
      if (!cancelled) setGoogleClientId(validClientId || null);
    });
    const onAuth = () => {
      fetch('/api/auth/me', { credentials: 'include' })
        .then(async (response) => (response.ok ? response.json() : null))
        .then((session) => {
          if (cancelled) return;
          if (session?.user) {
            setUser(session.user);
            setName(session.user.name);
          } else {
            setUser(null);
          }
        })
        .catch(() => undefined);
    };
    window.addEventListener('f1mod-auth', onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener('f1mod-auth', onAuth);
    };
  }, []);

  useEffect(() => {
    if (!open || !googleClientId) return undefined;
    let cancelled = false;
    let detach = () => {};
    const frame = window.requestAnimationFrame(() => {
      const parent = document.getElementById('google-signin');
      if (!parent) return;
      renderGoogleButton(parent, googleClientId, {
        text: mode === 'signup' ? 'signup_with' : 'continue_with',
        context: mode === 'signup' ? 'signup' : 'signin',
        width: 288,
        onCredential: async (credential) => {
          setBusy(true);
          setError('');
          try {
            const data = await request('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential }),
            });
            setUser(data.user);
            setName(data.user.name);
            setPassword('');
            setOpen(false);
            window.dispatchEvent(new Event('f1mod-auth'));
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
  }, [open, googleClientId, mode]);

  async function submitAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = mode === 'signup'
        ? await request('/api/users', { method: 'POST', body: JSON.stringify({ name, email, password }) })
        : await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setUser(data.user);
      setName(data.user.name);
      setPassword('');
      window.dispatchEvent(new Event('f1mod-auth'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível continuar.');
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await request('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          currentPassword,
          newPassword,
        }),
      });
      setUser(data.user);
      setName(data.user.name);
      setCurrentPassword('');
      setNewPassword('');
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    setError('');
    try {
      await request('/api/auth/logout', { method: 'POST', body: '{}' });
      setUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setMode('login');
      window.dispatchEvent(new Event('f1mod-auth'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível sair.');
    } finally {
      setBusy(false);
    }
  }

  const initials = user
    ? user.name.split(' ').slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
    : '';
  const planDate = user?.subscription.dueAt
    || (user?.subscription.status === 'active'
      ? user.subscription.currentPeriodEndsAt
      : user?.subscription.trialEndsAt);
  const renewal = user?.subscription.renewal
    || (planDate && new Date(planDate).getTime() < Date.now() ? 'overdue' : 'current');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="account-trigger" aria-label={user ? 'Configurações da conta' : 'Entrar'}>
          {initials ? <span>{initials}</span> : <User className="h-5 w-5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="account-menu z-[80] w-auto border-0 bg-transparent p-0 shadow-none"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          const target = event.target;
          if (target instanceof HTMLIFrameElement) event.preventDefault();
        }}
      >
        {user ? (
          <form className="account-menu__settings" onSubmit={saveSettings}>
            <h2 className="account-menu__title">Configurações</h2>
            <label>
              Nome
              <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
            </label>
            <label>
              E-mail
              <input value={user.email} readOnly />
            </label>
            <div className="account-menu__plan">
              <strong>{PLAN_LABEL[user.subscription.status]}</strong>
              {planDate ? <span>{renewal === 'overdue' ? 'venceu em' : 'vence em'} {formatDay(planDate)}</span> : null}
              {renewal ? (
                <p className={`account-menu__renewal account-menu__renewal--${renewal}`}>
                  {RENEWAL_MESSAGE[renewal]}
                </p>
              ) : null}
            </div>
            {user.hasPassword ? (
              <>
                <label>
                  Senha atual
                  <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
                </label>
                <label>
                  Nova senha
                  <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
                </label>
              </>
            ) : null}
            {error ? <p className="account-menu__error">{error}</p> : null}
            <button className="account-menu__submit" type="submit" disabled={busy}>Salvar</button>
            <button className="account-menu__ghost" type="button" onClick={logout} disabled={busy}>Sair</button>
          </form>
        ) : (
          <div>
            <h2 className="account-menu__title">{mode === 'signup' ? 'Criar conta' : 'Entrar'}</h2>
            <p className="account-menu__note">O primeiro mês é grátis.</p>
            <div className="account-menu__google" id="google-signin">
              {googleClientId ? null : (
                <button
                  type="button"
                  className="account-menu__ghost account-menu__google-fallback"
                  onClick={() => setError(builtClientId
                    ? 'O valor salvo não é um Client ID. Use o ID que termina com .apps.googleusercontent.com.'
                    : 'Falta o Client ID do Google no servidor para concluir esse login.')}
                >
                  Continuar com Google
                </button>
              )}
            </div>
            <div className="account-menu__divider">ou</div>
            <form className="account-menu__form" onSubmit={submitAccount}>
              {mode === 'signup' ? (
                <label>
                  Nome
                  <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                </label>
              ) : null}
              <label>
                E-mail
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
              </label>
              <label>
                Senha
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
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
        )}
      </PopoverContent>
    </Popover>
  );
}
