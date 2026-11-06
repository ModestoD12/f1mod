type CredentialHandler = (credential: string) => void;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            context?: 'signin' | 'signup' | 'use';
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            use_fedcm_for_prompt?: boolean;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const listeners = new Set<CredentialHandler>();

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-auth]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google indisponível')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?hl=pt-BR';
    script.async = true;
    script.dataset.googleAuth = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google indisponível'));
    document.head.appendChild(script);
  });
}

function clearCoveringFrame() {
  document.querySelectorAll<HTMLIFrameElement>('body > iframe[src*="accounts.google.com"]').forEach((frame) => {
    const coversWidth = frame.offsetWidth > window.innerWidth * 0.7;
    const coversHeight = frame.offsetHeight > window.innerHeight * 0.7;
    if (coversWidth && coversHeight) frame.remove();
  });
}

export async function renderGoogleButton(
  parent: HTMLElement,
  clientId: string,
  options: {
    text: 'continue_with' | 'signup_with';
    context: 'signin' | 'signup';
    width: number;
    onCredential: CredentialHandler;
  },
) {
  await loadGoogleScript();
  const google = window.google?.accounts?.id;
  if (!google) throw new Error('Google indisponível');

  google.initialize({
    client_id: clientId,
    context: options.context,
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: false,
    ux_mode: 'popup',
    callback: (response) => {
      clearCoveringFrame();
      listeners.forEach((listener) => listener(response.credential));
    },
  });

  listeners.add(options.onCredential);
  parent.replaceChildren();
  google.renderButton(parent, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    text: options.text,
    shape: 'pill',
    width: parent.clientWidth > 0 ? Math.min(options.width, parent.clientWidth) : options.width,
  });

  return () => {
    listeners.delete(options.onCredential);
  };
}
