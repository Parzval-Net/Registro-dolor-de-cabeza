import { FormEvent, useState } from 'react';

export type AuthMode = 'login' | 'register';

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirm: string;
  remember: boolean;
}

interface AuthGateProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (payload: LoginPayload) => Promise<void> | void;
  onRegister: (payload: RegisterPayload) => Promise<void> | void;
  busy?: boolean;
}

const AuthGate = ({ mode, onModeChange, onLogin, onRegister, busy = false }: AuthGateProps) => {
  const [loginState, setLoginState] = useState<LoginPayload>({
    email: '',
    password: '',
    remember: true,
  });

  const [registerState, setRegisterState] = useState<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    confirm: '',
    remember: true,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      onLogin(loginState);
    } else {
      onRegister(registerState);
    }
  };

  const switchTo = (target: AuthMode) => {
    onModeChange(target);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card animate-fade-in">
        <div className="auth-logo">🧠</div>
        <h1>Tu salud, siempre contigo</h1>
        <p>Registra tus episodios de migraña y descubre patrones personalizados.</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`.trim()}
            onClick={() => switchTo('login')}
            disabled={busy}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`.trim()}
            onClick={() => switchTo('register')}
            disabled={busy}
          >
            Crear cuenta
          </button>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
                value={loginState.email}
                onChange={(event) => setLoginState((prev) => ({ ...prev, email: event.target.value.trim() }))}
                disabled={busy}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                placeholder="••••••"
                value={loginState.password}
                onChange={(event) => setLoginState((prev) => ({ ...prev, password: event.target.value }))}
                disabled={busy}
              />
            </label>
            <div className="auth-meta">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={loginState.remember}
                  onChange={(event) => setLoginState((prev) => ({ ...prev, remember: event.target.checked }))}
                  disabled={busy}
                />
                Mantener sesión activa
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => switchTo('register')}
                disabled={busy}
              >
                Crear cuenta
              </button>
            </div>
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? 'Accediendo…' : 'Acceder'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Nombre completo
              <input
                type="text"
                autoComplete="name"
                required
                placeholder="Tu nombre"
                value={registerState.name}
                onChange={(event) => setRegisterState((prev) => ({ ...prev, name: event.target.value }))}
                disabled={busy}
              />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="tu@correo.com"
                value={registerState.email}
                onChange={(event) => setRegisterState((prev) => ({ ...prev, email: event.target.value.trim() }))}
                disabled={busy}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={registerState.password}
                onChange={(event) => setRegisterState((prev) => ({ ...prev, password: event.target.value }))}
                disabled={busy}
              />
            </label>
            <label>
              Confirmar contraseña
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Repite tu contraseña"
                value={registerState.confirm}
                onChange={(event) => setRegisterState((prev) => ({ ...prev, confirm: event.target.value }))}
                disabled={busy}
              />
            </label>
            <div className="auth-meta">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={registerState.remember}
                  onChange={(event) => setRegisterState((prev) => ({ ...prev, remember: event.target.checked }))}
                  disabled={busy}
                />
                Mantener sesión activa
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() => switchTo('login')}
                disabled={busy}
              >
                Ya tengo cuenta
              </button>
            </div>
            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Tus datos se guardan de forma privada en este dispositivo. Respáldalos si deseas usarlos en otros equipos.
        </p>
      </div>
    </div>
  );
};

export default AuthGate;
