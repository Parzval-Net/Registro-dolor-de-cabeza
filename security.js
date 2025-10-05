(function(){
  const base64 = str => typeof atob === 'function' ? atob(str) : Buffer.from(str, 'base64').toString('utf8');
  const ADMIN_USER = base64('b3duZXJAbWlncmFjYXJlLmFwcA==');
  const SECRET_PATH = '/' + base64('b3duZXItY29uc29sZS05ZjNiMWNlZA==');
  const ADMIN_HASH = 'fbe5fb5a1ac8baff9697730386868cf3d3e5beeddb36bf02e670e7fe043d132b';
  const STORAGE_KEY = 'migracare:ownerAuth';
  const ATTEMPT_KEY = 'migracare:ownerAttempts';
  const MAX_ATTEMPTS = 5;
  const OWNER_CLASS = 'migracare-owner';
  const ADMIN_CLASS = 'migracare-admin-only';
  const ADMIN_LABELS = ['configuración','administración','panel'];
  const OWNER_EVENT = 'migracare:owner-updated';

  const state = {
    owner: false,
    initDone: false,
    observer: null,
    overlay: null
  };

  function toHex(buffer){
    return Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  async function hashCredentials(user, password){
    if(!(window.crypto && crypto.subtle)){
      throw new Error('Crypto API unavailable');
    }
    const data = new TextEncoder().encode(`${user}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return toHex(digest);
  }

  function getAttempts(){
    try { return Number(sessionStorage.getItem(ATTEMPT_KEY)) || 0; } catch(_) { return 0; }
  }

  function incrementAttempts(){
    try { sessionStorage.setItem(ATTEMPT_KEY, String(getAttempts()+1)); } catch(_) {}
  }

  function resetAttempts(){
    try { sessionStorage.removeItem(ATTEMPT_KEY); } catch(_) {}
  }

  function setOwnerMode(enabled){
    state.owner = !!enabled;
    if(enabled){
      document.body.classList.add(OWNER_CLASS);
      try { localStorage.setItem(STORAGE_KEY, 'true'); } catch(_) {}
    } else {
      document.body.classList.remove(OWNER_CLASS);
      try { localStorage.removeItem(STORAGE_KEY); } catch(_) {}
    }
    document.dispatchEvent(new CustomEvent(OWNER_EVENT, { detail: { owner: state.owner }}));
    annotateAdminElements();
  }

  function annotateAdminElements(){
    const shouldShow = state.owner;
    const nodes = Array.from(document.querySelectorAll('button, [role="button"], a, div'));
    nodes.forEach(node => {
      if(!node || node.classList && node.classList.contains(ADMIN_CLASS)) return;
      const text = (node.textContent || '').trim().toLowerCase();
      if(text && ADMIN_LABELS.some(label => text === label || text.includes(label))){
        node.classList.add(ADMIN_CLASS);
      }
    });
    const adminNodes = document.querySelectorAll('.'+ADMIN_CLASS);
    adminNodes.forEach(node => {
      if(state.owner){
        node.style.removeProperty('display');
        node.removeAttribute('aria-hidden');
      } else {
        node.style.setProperty('display','none','important');
        node.setAttribute('aria-hidden','true');
      }
    });
  }

  function ensureObserver(){
    if(state.observer) return;
    state.observer = new MutationObserver(() => annotateAdminElements());
    state.observer.observe(document.body, { childList: true, subtree: true });
  }

  function buildOverlay(){
    if(state.overlay){
      state.overlay.remove();
    }
    const overlay = document.createElement('div');
    overlay.id = 'migracare-admin-overlay';
    overlay.innerHTML = `
      <style>
        #migracare-admin-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.85);z-index:9999;font-family:'Inter',sans-serif;color:#111827;padding:1.5rem;}
        #migracare-admin-overlay .panel{width:100%;max-width:420px;background:#fff;border-radius:18px;padding:2rem;box-shadow:0 20px 45px rgba(15,23,42,.35);position:relative;}
        #migracare-admin-overlay h1{font-size:1.5rem;font-weight:700;color:#312e81;margin-bottom:1rem;text-align:center;}
        #migracare-admin-overlay p{font-size:.95rem;color:#4b5563;margin:.25rem 0 1.25rem;text-align:center;}
        #migracare-admin-overlay label{display:block;font-weight:600;color:#1f2937;margin-bottom:.35rem;}
        #migracare-admin-overlay input{width:100%;padding:.75rem 1rem;border:1px solid #cbd5f5;border-radius:12px;font-size:.95rem;transition:border-color .2s, box-shadow .2s;}
        #migracare-admin-overlay input:focus{outline:none;border-color:#4c1d95;box-shadow:0 0 0 3px rgba(76,29,149,.15);}
        #migracare-admin-overlay button{width:100%;margin-top:1.1rem;padding:.85rem 1rem;background:#4c1d95;color:#fff;font-weight:600;border:none;border-radius:12px;cursor:pointer;transition:background .2s,transform .2s;}
        #migracare-admin-overlay button:hover{background:#4338ca;transform:translateY(-1px);}
        #migracare-admin-overlay .error{margin-top:.75rem;color:#b91c1c;font-size:.9rem;text-align:center;display:none;}
        #migracare-admin-overlay .close{position:absolute;top:.6rem;right:.8rem;background:none;border:none;font-size:1.2rem;cursor:pointer;color:#64748b;}
      </style>
      <div class="panel" role="dialog" aria-modal="true" aria-labelledby="migracare-admin-title">
        <button class="close" type="button" aria-label="Cerrar">×</button>
        <h1 id="migracare-admin-title">Panel de administración</h1>
        <p>Introduce las credenciales maestras para acceder a la configuración avanzada.</p>
        <form>
          <div>
            <label for="migracare-admin-user">Usuario</label>
            <input id="migracare-admin-user" name="user" type="email" autocomplete="off" spellcheck="false" required>
          </div>
          <div style="margin-top:1rem;">
            <label for="migracare-admin-pass">Contraseña</label>
            <input id="migracare-admin-pass" name="password" type="password" autocomplete="new-password" required>
          </div>
          <button type="submit">Acceder</button>
          <div class="error" role="alert"></div>
        </form>
      </div>
    `;
    state.overlay = overlay;
    return overlay;
  }

  function lockForCooldown(){
    const overlay = buildOverlay();
    const errorBox = overlay.querySelector('.error');
    const form = overlay.querySelector('form');
    const closeBtn = overlay.querySelector('.close');
    form.style.display = 'none';
    if(closeBtn) closeBtn.style.display = 'none';
    let seconds = 120;
    errorBox.style.display='block';
    errorBox.textContent = `Demasiados intentos fallidos. Espera ${seconds}s para reintentar.`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', evt => { if(evt.target === overlay) evt.stopPropagation(); });
    const timer = setInterval(()=>{
      seconds--;
      if(seconds <= 0){
        clearInterval(timer);
        overlay.remove();
        resetAttempts();
      } else {
        errorBox.textContent = `Demasiados intentos fallidos. Espera ${seconds}s para reintentar.`;
      }
    },1000);
  }

  function showAdminOverlay(){
    if(getAttempts() >= MAX_ATTEMPTS){
      lockForCooldown();
      return;
    }
    const overlay = buildOverlay();
    const form = overlay.querySelector('form');
    const errorBox = overlay.querySelector('.error');
    const closeBtn = overlay.querySelector('.close');
    const userInput = overlay.querySelector('#migracare-admin-user');
    const passInput = overlay.querySelector('#migracare-admin-pass');
    document.body.appendChild(overlay);
    userInput.value = '';
    passInput.value = '';
    errorBox.style.display='none';
    userInput.focus();

    function hide(){
      overlay.remove();
      window.history.replaceState(null,'','/');
    }

    closeBtn.addEventListener('click', hide);
    overlay.addEventListener('click', evt=>{ if(evt.target===overlay) hide(); });

    form.addEventListener('submit', async evt => {
      evt.preventDefault();
      errorBox.style.display='none';
      const user = userInput.value.trim();
      const pass = passInput.value;
      try{
        if(!user || !pass){
          errorBox.textContent = 'Completa ambos campos.';
          errorBox.style.display='block';
          return;
        }
        const digest = await hashCredentials(user, pass);
        if(user === ADMIN_USER && digest === ADMIN_HASH){
          resetAttempts();
          setOwnerMode(true);
          overlay.remove();
          window.history.replaceState(null,'','/');
          window.setTimeout(triggerAdminView,300);
          return;
        }
        incrementAttempts();
        const remaining = MAX_ATTEMPTS - getAttempts();
        if(remaining <= 0){
          overlay.remove();
          lockForCooldown();
        } else {
          errorBox.textContent = `Credenciales incorrectas. Intentos restantes: ${remaining}.`;
          errorBox.style.display='block';
          passInput.value='';
          passInput.focus();
        }
      }catch(err){
        console.error('[MigraCare] admin login failed', err);
        errorBox.textContent = 'No se pudo validar. Revisa tu conexión.';
        errorBox.style.display='block';
      }
    },{ once: true });
  }

  function triggerAdminView(){
    annotateAdminElements();
    const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
    const adminButton = buttons.find(btn => {
      const text = (btn.textContent || '').trim().toLowerCase();
      return text && ADMIN_LABELS.some(label => text === label || text.includes(label));
    });
    if(adminButton){
      adminButton.click();
      adminButton.blur();
    }
  }

  function interceptClicks(){
    document.addEventListener('click', evt => {
      const path = evt.composedPath ? evt.composedPath() : [evt.target];
      const adminNode = path.find(node => node && node.classList && node.classList.contains(ADMIN_CLASS));
      if(adminNode && !state.owner){
        evt.preventDefault();
        evt.stopPropagation();
        return false;
      }
    }, true);
  }

  function checkStoredOwner(){
    let stored = false;
    try { stored = localStorage.getItem(STORAGE_KEY) === 'true'; } catch(_) {}
    setOwnerMode(stored);
  }

  function handleNavigation(){
    const current = window.location.pathname.replace(/\/+/g,'/');
    if(current === SECRET_PATH){
      showAdminOverlay();
    } else if(!current.startsWith(SECRET_PATH)){
      if(!state.owner){
        annotateAdminElements();
      }
    }
  }

  function init(){
    if(state.initDone) return;
    state.initDone = true;
    const style = document.createElement('style');
    style.textContent = `.${ADMIN_CLASS}{display:none !important;} body.${OWNER_CLASS} .${ADMIN_CLASS}{display:initial !important;}`;
    document.head.appendChild(style);
    ensureObserver();
    interceptClicks();
    checkStoredOwner();
    annotateAdminElements();
    handleNavigation();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('popstate', handleNavigation);
  window.addEventListener('hashchange', handleNavigation);
  document.addEventListener(OWNER_EVENT, annotateAdminElements);

  if(document.readyState === 'interactive' || document.readyState === 'complete'){
    init();
  }
})();
