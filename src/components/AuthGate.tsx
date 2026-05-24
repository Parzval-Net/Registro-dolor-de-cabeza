import { FormEvent, useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Heart } from 'lucide-react';

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

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
  onForgotPassword?: (email: string) => Promise<void> | void;
  onResetPassword?: (password: string) => Promise<void> | void;
  busy?: boolean;
}

const AuthGate = ({ 
  mode, 
  onModeChange, 
  onLogin, 
  onRegister, 
  onForgotPassword,
  onResetPassword,
  busy = false 
}: AuthGateProps) => {
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

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  // Estados de visibilidad de contraseñas
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'login') {
      onLogin(loginState);
    } else if (mode === 'register') {
      onRegister(registerState);
    } else if (mode === 'forgot-password') {
      if (onForgotPassword) onForgotPassword(forgotEmail.trim());
    } else if (mode === 'reset-password') {
      if (resetPassword !== resetConfirm) {
        alert('Las contraseñas no coinciden');
        return;
      }
      if (onResetPassword) onResetPassword(resetPassword);
    }
  };

  const switchTo = (target: AuthMode) => {
    // Resetear visibilidades de contraseñas al cambiar de pestaña
    setShowPass(false);
    setShowConfirmPass(false);
    onModeChange(target);
  };

  return (
    <div className="auth-screen">
      <div className="auth-card animate-fade-in">
        
        {/* COLUMNA VISUAL IZQUIERDA (Solo visible en escritorio >= 768px) */}
        <div className="auth-visual-column">
          <div className="flex items-center gap-2" style={{ alignSelf: 'flex-start' }}>
            <Heart className="w-6 h-6 text-indigo-200 fill-indigo-200" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '0.5px' }}>MigraCare</span>
          </div>
          
          <img src="/auth_banner_illustration.png" alt="Cerebro Relajado" className="auth-brain-image" />
          
          <div className="auth-visual-text">
            <h2>Tu salud, siempre bajo tu control</h2>
            <p>Registra tus episodios de migraña con precisión clínica, descubre factores desencadenantes y recupera el bienestar con análisis inteligentes.</p>
          </div>
        </div>

        {/* COLUMNA DEL FORMULARIO DERECHA (Siempre visible) */}
        <div className="auth-form-column">
          
          {/* Cabezal Móvil (Solo visible en móviles < 768px) */}
          <div className="auth-mobile-header" style={{ display: 'none' }}>
            <div className="auth-mobile-logo">
              <img src="/auth_banner_illustration.png" alt="MigraCare Logo" />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '22px', margin: 0, color: 'var(--foreground)' }}>MigraCare</h2>
          </div>

          {/* Encabezado del Formulario adaptado según el Modo */}
          <div className="auth-form-header">
            {mode === 'forgot-password' ? (
              <>
                <h1>Recuperar Contraseña</h1>
                <p>Ingresa tu correo registrado para recibir un enlace de recuperación seguro en la nube.</p>
              </>
            ) : mode === 'reset-password' ? (
              <>
                <h1>Restablecer Contraseña</h1>
                <p>Ingresa tu nueva contraseña para restaurar el acceso seguro a tu cuenta.</p>
              </>
            ) : mode === 'register' ? (
              <>
                <h1>Comienza tu Monitoreo</h1>
                <p>Crea tu cuenta de grado clínico para descubrir patrones en tus dolores de cabeza.</p>
              </>
            ) : (
              <>
                <h1>Bienvenido de Nuevo</h1>
                <p>Inicia sesión para sincronizar tus registros médicos de forma privada.</p>
              </>
            )}
          </div>

          {/* TABS DE SELECCIÓN (Solo visibles en login / register) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
                onClick={() => switchTo('login')}
                disabled={busy}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
                onClick={() => switchTo('register')}
                disabled={busy}
              >
                Crear cuenta
              </button>
            </div>
          )}

          {/* 1. FORMULARIO DE ACCESO (LOGIN) */}
          {mode === 'login' && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="email">
                Correo electrónico
                <div className="auth-input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="username"
                    required
                    placeholder="tu@correo.com"
                    value={loginState.email}
                    onChange={(event) => setLoginState((prev) => ({ ...prev, email: event.target.value.trim() }))}
                    disabled={busy}
                  />
                  <Mail className="auth-input-icon" size={18} />
                </div>
              </label>

              <label htmlFor="password">
                Contraseña
                <div className="auth-input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                    placeholder="••••••"
                    value={loginState.password}
                    onChange={(event) => setLoginState((prev) => ({ ...prev, password: event.target.value }))}
                    disabled={busy}
                  />
                  <Lock className="auth-input-icon" size={18} />
                  <button
                    type="button"
                    className="auth-visibility-btn"
                    onClick={() => setShowPass(!showPass)}
                    disabled={busy}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="auth-meta">
                <label className="remember cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginState.remember}
                    onChange={(event) => setLoginState((prev) => ({ ...prev, remember: event.target.checked }))}
                    disabled={busy}
                  />
                  <span>Mantener sesión</span>
                </label>
                
                <button
                  type="button"
                  className="link-button"
                  onClick={() => switchTo('forgot-password')}
                  disabled={busy}
                >
                  ¿La olvidaste?
                </button>
              </div>

              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? 'Accediendo…' : 'Acceder'}
              </button>
            </form>
          )}

          {/* 2. FORMULARIO DE REGISTRO */}
          {mode === 'register' && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="name">
                Nombre completo
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Tu nombre"
                    value={registerState.name}
                    onChange={(event) => setRegisterState((prev) => ({ ...prev, name: event.target.value }))}
                    disabled={busy}
                  />
                  <User className="auth-input-icon" size={18} />
                </div>
              </label>

              <label htmlFor="reg-email">
                Correo electrónico
                <div className="auth-input-wrapper">
                  <input
                    type="email"
                    id="reg-email"
                    name="email"
                    autoComplete="username"
                    required
                    placeholder="tu@correo.com"
                    value={registerState.email}
                    onChange={(event) => setRegisterState((prev) => ({ ...prev, email: event.target.value.trim() }))}
                    disabled={busy}
                  />
                  <Mail className="auth-input-icon" size={18} />
                </div>
              </label>

              <label htmlFor="new-password">
                Contraseña
                <div className="auth-input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    id="new-password"
                    name="new-password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={registerState.password}
                    onChange={(event) => setRegisterState((prev) => ({ ...prev, password: event.target.value }))}
                    disabled={busy}
                  />
                  <Lock className="auth-input-icon" size={18} />
                  <button
                    type="button"
                    className="auth-visibility-btn"
                    onClick={() => setShowPass(!showPass)}
                    disabled={busy}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label htmlFor="confirm-password">
                Confirmar contraseña
                <div className="auth-input-wrapper">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    id="confirm-password"
                    name="confirm-password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Repite tu contraseña"
                    value={registerState.confirm}
                    onChange={(event) => setRegisterState((prev) => ({ ...prev, confirm: event.target.value }))}
                    disabled={busy}
                  />
                  <Lock className="auth-input-icon" size={18} />
                  <button
                    type="button"
                    className="auth-visibility-btn"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    disabled={busy}
                    aria-label={showConfirmPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="auth-meta">
                <label className="remember cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registerState.remember}
                    onChange={(event) => setRegisterState((prev) => ({ ...prev, remember: event.target.checked }))}
                    disabled={busy}
                  />
                  <span>Mantener sesión</span>
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

          {/* 3. FORMULARIO DE OLVIDÓ CONTRASEÑA */}
          {mode === 'forgot-password' && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="forgot-email">
                Correo electrónico
                <div className="auth-input-wrapper">
                  <input
                    type="email"
                    id="forgot-email"
                    name="forgot-email"
                    autoComplete="email"
                    required
                    placeholder="tu@correo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={busy}
                  />
                  <Mail className="auth-input-icon" size={18} />
                </div>
              </label>

              <div className="auth-meta flex justify-end w-full">
                <button
                  type="button"
                  className="link-button"
                  onClick={() => switchTo('login')}
                  disabled={busy}
                >
                  Volver a Iniciar Sesión
                </button>
              </div>

              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? 'Enviando enlace...' : 'Enviar Correo de Recuperación'}
              </button>
            </form>
          )}

          {/* 4. FORMULARIO DE RESTABLECER CONTRASEÑA */}
          {mode === 'reset-password' && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <label htmlFor="reset-password-input">
                Nueva Contraseña
                <div className="auth-input-wrapper">
                  <input
                    type={showPass ? "text" : "password"}
                    id="reset-password-input"
                    name="reset-password-input"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    disabled={busy}
                  />
                  <Lock className="auth-input-icon" size={18} />
                  <button
                    type="button"
                    className="auth-visibility-btn"
                    onClick={() => setShowPass(!showPass)}
                    disabled={busy}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label htmlFor="reset-confirm-password-input">
                Confirmar Nueva Contraseña
                <div className="auth-input-wrapper">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    id="reset-confirm-password-input"
                    name="reset-confirm-password-input"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder="Repite tu nueva contraseña"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                    disabled={busy}
                  />
                  <Lock className="auth-input-icon" size={18} />
                  <button
                    type="button"
                    className="auth-visibility-btn"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    disabled={busy}
                    aria-label={showConfirmPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? 'Restableciendo...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          )}

          {/* FOOTER INFORMATIVO */}
          <p className="auth-footer">
            Tus datos se encriptan de forma segura y se protegen mediante políticas RLS en la base de datos de Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
