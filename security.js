(function(){
  const base64 = str => typeof atob === 'function' ? atob(str) : Buffer.from(str, 'base64').toString('utf8');
  const SECRET_SEGMENT = base64('b3duZXItY29uc29sZS05ZjNiMWNlZA==');
  const ADMIN_USER = base64('b3duZXJAbWlncmFjYXJlLmFwcA==');
  const PROJECT_ROOT = (() => {
    const path = decodeURIComponent(window.location.pathname || '/');
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return '/';
    return '/' + parts[0] + '/';
  })();
  const SECRET_PATH = (() => {
    const base = PROJECT_ROOT.endsWith('/') ? PROJECT_ROOT : PROJECT_ROOT + '/';
    const joined = `${base}${SECRET_SEGMENT}`.replace(/\/+/g, '/');
    return joined.endsWith('/') ? joined.slice(0, -1) : joined;
  })();
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
    overlay: null,
    overlayOpen: false,
    currentView: 'Inicio'
  };

  function normalizePath(path){
    const decoded = decodeURIComponent(path || '/');
    const collapsed = decoded.replace(/\/+/g, '/');
    const withoutTrailing = collapsed.endsWith('/') && collapsed !== '/' ? collapsed.slice(0, -1) : collapsed;
    return withoutTrailing || '/';
  }

  function isSecretRoute(){
    const path = normalizePath(window.location.pathname);
    if(path === normalizePath(SECRET_PATH)) return true;
    const search = decodeURIComponent(window.location.search || '');
    if(search.includes(SECRET_SEGMENT)) return true;
    const hash = decodeURIComponent(window.location.hash || '');
    if(hash.includes(SECRET_SEGMENT)) return true;
    const href = decodeURIComponent(window.location.href || '');
    if(href.includes(SECRET_SEGMENT)) return true;
    return false;
  }

  function resetToRoot(){
    try{
      const target = PROJECT_ROOT || '/';
      window.history.replaceState(null, '', target);
    }catch(_){/* ignore */}
  }

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

  function enhanceUI(){
    const themeToggle = document.querySelector('button[title="Cambiar tema"]');
    if(themeToggle && !themeToggle.dataset.removed){
      themeToggle.dataset.removed = 'true';
      themeToggle.remove();
    }

    const registerBtn = document.querySelector('button[aria-label="Registrar nuevo episodio de dolor"]');
    if(registerBtn && !registerBtn.dataset.enhanced){
      registerBtn.dataset.enhanced = 'true';
      registerBtn.textContent = 'Registrar';
    }

    const backupWrapper = document.getElementById('migracare-backup');
    if(backupWrapper && !backupWrapper.dataset.positioned){
      backupWrapper.dataset.positioned = 'true';
      backupWrapper.style.bottom = 'calc(5.5rem + env(safe-area-inset-bottom, 0px))';
      const card = backupWrapper.querySelector('.card');
      if(card){
        card.style.bottom = '3.5rem';
      }
    }

    cleanupDurationRows();
    guardSettingsNav();
    syncViewState();
  }

  function cleanupDurationRows(){
    const spans = Array.from(document.querySelectorAll('span'));
    spans.forEach(span => {
      const text = (span.textContent || '').trim().toLowerCase();
      if(!text.startsWith('duración')) return;
      const container = span.closest('.flex') || span.parentElement;
      if(container && container.parentElement){
        container.parentElement.removeChild(container);
      }
    });
  }

  function detectCurrentView(){
    if(document.querySelector('.auth-screen')){
      return 'Login';
    }
    const nav = document.querySelector('nav.lg\\:hidden') || document.querySelector('nav[style*="position: fixed"]');
    if(!nav) return state.currentView;
    const buttons = Array.from(nav.querySelectorAll('button'));
    let active = buttons.find(btn => {
      const bg = btn.style.background || '';
      return bg.includes('linear-gradient') && (bg.includes('#667eea') || bg.includes('rgba(102, 126, 234'));
    });
    if(!active){
      active = buttons.find(btn => (btn.style.color || '').includes('rgb(255'));
    }
    if(!active) return state.currentView;
    const labelSpan = Array.from(active.querySelectorAll('span')).pop();
    const label = (labelSpan ? labelSpan.textContent : active.textContent || '').trim();
    return label || state.currentView;
  }

  function toggleRegisterAndBackup(view){
    const inAuthScreen = !!document.querySelector('.auth-screen');
    const registerBtn = document.querySelector('button[aria-label="Registrar nuevo episodio de dolor"]');
    if(registerBtn){
      if(!registerBtn.dataset.enhanced){
        registerBtn.dataset.enhanced = 'true';
      }
      registerBtn.textContent = 'Registrar';
      registerBtn.style.display = !inAuthScreen && (!view || view === 'Inicio') ? '' : 'none';
    }
    const backupWrapper = document.getElementById('migracare-backup');
    if(backupWrapper){
      if(!inAuthScreen && (!view || view === 'Inicio')){
        backupWrapper.style.display = '';
      } else {
        const card = backupWrapper.querySelector('.card');
        if(card){
          card.classList.remove('open');
        }
        backupWrapper.style.display = 'none';
      }
    }
  }

  function updateLayoutForView(view){
    const sections = document.querySelectorAll('div[style*="padding: 3rem 0"]');
    sections.forEach(sec => {
      sec.style.padding = view === 'Inicio' ? '2rem 0 4rem 0' : '1.5rem 0 4rem 0';
    });

    const quickNavGrid = document.querySelector('div[style*="gridTemplateColumns:\"repeat(auto-fit, minmax(140px, 1fr))\""]');
    if(quickNavGrid){
      quickNavGrid.style.gridTemplateColumns = view === 'Inicio' ? 'repeat(auto-fit, minmax(120px, 1fr))' : quickNavGrid.style.gridTemplateColumns;
      quickNavGrid.style.gap = view === 'Inicio' ? '0.75rem' : quickNavGrid.style.gap;
    }

    if(quickNavGrid){
      const buttons = quickNavGrid.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.style.padding = view === 'Inicio' ? '1.5rem 1rem' : '1.25rem .75rem';
      });
    }
  }

  function guardSettingsNav(){
    const nav = document.querySelector('nav.lg\\:hidden') || document.querySelector('nav[style*="position: fixed"]');
    if(!nav) return;
    const buttons = Array.from(nav.querySelectorAll('button'));
    buttons.forEach(btn => {
      const label = (btn.textContent || '').trim().toLowerCase();
      if((label.includes('ajustes') || label.includes('configuración')) && !btn.dataset.guard){
        btn.dataset.guard = 'true';
        btn.addEventListener('click', evt => {
          if(state.owner) return;
          evt.preventDefault();
          evt.stopPropagation();
          evt.stopImmediatePropagation?.();
          showAdminOverlay();
        }, true);
      }
    });
  }

  function syncViewState(){
    const detected = detectCurrentView();
    if(detected && detected !== state.currentView){
      state.currentView = detected;
      document.body.setAttribute('data-migracare-view', detected);
      if(detected.toLowerCase().includes('ajuste') && !state.owner && !state.overlayOpen){
        showAdminOverlay();
      }
    }
    const current = state.currentView;
    toggleRegisterAndBackup(current);
    updateLayoutForView(current);
    guardSettingsNav();
    cleanupDurationRows();
  }

  function ensureObserver(){
    if(state.observer) return;
    state.observer = new MutationObserver(() => {
      annotateAdminElements();
      enhanceUI();
    });
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
    state.overlayOpen = true;
    resetToRoot();
    overlay.addEventListener('click', evt => { if(evt.target === overlay) evt.stopPropagation(); });
    const timer = setInterval(()=>{
      seconds--;
      if(seconds <= 0){
        clearInterval(timer);
        overlay.remove();
        state.overlayOpen = false;
        resetAttempts();
      } else {
        errorBox.textContent = `Demasiados intentos fallidos. Espera ${seconds}s para reintentar.`;
      }
    },1000);
  }

  function showAdminOverlay(){
    if(state.overlayOpen) return;
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
    state.overlayOpen = true;
    resetToRoot();
    userInput.value = '';
    passInput.value = '';
    errorBox.style.display='none';
    userInput.focus();

    function hide(){
      state.overlayOpen = false;
      overlay.remove();
      resetToRoot();
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
          state.overlayOpen = false;
          overlay.remove();
          resetToRoot();
          window.setTimeout(triggerAdminView,300);
          return;
        }
        incrementAttempts();
        const remaining = MAX_ATTEMPTS - getAttempts();
        if(remaining <= 0){
          state.overlayOpen = false;
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

  function collectBackupSnapshot(){
    const snapshot = {
      exportedAt: new Date().toISOString(),
      data: {}
    };
    try{
      for(let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        if(!key) continue;
        if(key === STORAGE_KEY || key === ATTEMPT_KEY) continue;
        snapshot.data[key] = localStorage.getItem(key);
      }
    }catch(err){
      snapshot.error = err && err.message ? err.message : String(err);
    }
    return snapshot;
  }

  function downloadJSON(content, filename){
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function readFileText(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo.'));
      reader.readAsText(file, 'utf-8');
    });
  }

  function restoreBackupData(payload){
    if(!payload || typeof payload !== 'object'){
      throw new Error('Formato de respaldo inválido.');
    }
    const record = payload.data && typeof payload.data === 'object' ? payload.data : payload;
    const keys = Object.keys(record || {});
    if(!keys.length){
      throw new Error('No se encontraron datos para restaurar.');
    }
    keys.forEach(key => {
      if(key === STORAGE_KEY || key === ATTEMPT_KEY) return;
      const value = record[key];
      try{
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }catch(err){
        throw new Error('No se pudo guardar en almacenamiento local.');
      }
    });
  }

  function initBackupPanel(){
    if(document.getElementById('migracare-backup')) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'migracare-backup';
    wrapper.innerHTML = `
      <style>
        #migracare-backup{position:fixed;bottom:calc(5.5rem + env(safe-area-inset-bottom,0));right:1.25rem;z-index:9998;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;}
        #migracare-backup .fab{border:none;border-radius:9999px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:.85rem 1.35rem;font-weight:600;box-shadow:0 15px 35px rgba(79,70,229,.4);cursor:pointer;display:flex;align-items:center;gap:.5rem;transition:transform .2s,box-shadow .2s;}
        #migracare-backup .fab:hover{transform:translateY(-2px);box-shadow:0 20px 45px rgba(88,80,236,.45);}
        #migracare-backup .card{position:absolute;right:0;bottom:3.5rem;width:min(320px,90vw);background:#ffffff;border-radius:18px;padding:1.25rem 1.35rem;box-shadow:0 20px 45px rgba(15,23,42,.25);display:none;}
        #migracare-backup .card.open{display:block;}
        #migracare-backup .card h2{font-size:1.05rem;font-weight:700;color:#1e1b4b;margin:0 0 .5rem;}
        #migracare-backup .card p{font-size:.9rem;color:#475569;margin:.35rem 0 1rem;}
        #migracare-backup .actions{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;}
        #migracare-backup button.action{flex:1 1 auto;border:none;border-radius:12px;padding:.7rem 1rem;font-weight:600;background:#4338ca;color:white;cursor:pointer;transition:background .2s,transform .2s;}
        #migracare-backup button.action.secondary{background:#e2e8f0;color:#1e293b;}
        #migracare-backup button.action:hover{transform:translateY(-1px);background:#3730a3;}
        #migracare-backup label.import{flex:1 1 auto;position:relative;overflow:hidden;border-radius:12px;background:#f1f5f9;color:#1f2937;font-weight:600;padding:.7rem 1rem;text-align:center;cursor:pointer;}
        #migracare-backup label.import input{position:absolute;inset:0;opacity:0;cursor:pointer;}
        #migracare-backup .status{margin-top:.75rem;font-size:.85rem;color:#0f172a;min-height:1.1rem;}
        #migracare-backup .status.error{color:#b91c1c;}
        @media (max-width:480px){#migracare-backup{right:1rem;bottom:1rem;}#migracare-backup .card{width:min(280px,92vw);}}
      </style>
      <button type="button" class="fab" aria-label="Respaldo de datos">🛡️ Respaldo</button>
      <div class="card" role="dialog" aria-live="polite">
        <h2>Respalda tu información</h2>
        <p>Descarga un archivo para guardar tus episodios o impórtalo en otro dispositivo.</p>
        <div class="actions">
          <button type="button" class="action" data-action="export">Descargar respaldo</button>
          <label class="import">Importar respaldo<input type="file" data-role="import" accept="application/json" /></label>
          <button type="button" class="action secondary" data-action="close">Cerrar</button>
        </div>
        <div class="status" role="status"></div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const fab = wrapper.querySelector('.fab');
    const card = wrapper.querySelector('.card');
    const exportBtn = wrapper.querySelector('[data-action="export"]');
    const closeBtn = wrapper.querySelector('[data-action="close"]');
    const importInput = wrapper.querySelector('[data-role="import"]');
    const statusBox = wrapper.querySelector('.status');

    const closeCard = () => {
      card.classList.remove('open');
      if(statusBox) statusBox.textContent = '';
      if(importInput) importInput.value = '';
    };

    fab.addEventListener('click', () => {
      card.classList.toggle('open');
      if(card.classList.contains('open')){
        statusBox.textContent = '';
      }
    });

    closeBtn.addEventListener('click', closeCard);

    exportBtn.addEventListener('click', () => {
      try{
        const snapshot = collectBackupSnapshot();
        const fileName = `migraCare-respaldo-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
        downloadJSON(snapshot, fileName);
        statusBox.classList.remove('error');
        statusBox.textContent = 'Respaldo descargado. Guárdalo en un lugar seguro.';
      }catch(err){
        statusBox.classList.add('error');
        statusBox.textContent = err && err.message ? err.message : 'No se pudo crear el respaldo.';
      }
    });

    importInput.addEventListener('change', async evt => {
      const file = evt.target && evt.target.files ? evt.target.files[0] : null;
      if(!file){
        statusBox.classList.add('error');
        statusBox.textContent = 'Selecciona un archivo de respaldo.';
        return;
      }
      try{
        const raw = await readFileText(file);
        const payload = JSON.parse(raw);
        restoreBackupData(payload);
        statusBox.classList.remove('error');
        statusBox.textContent = 'Datos importados correctamente. La página se actualizará.';
        setTimeout(() => window.location.reload(), 1200);
      }catch(err){
        statusBox.classList.add('error');
        statusBox.textContent = err && err.message ? err.message : 'No se pudo importar el respaldo.';
      }finally{
        evt.target.value = '';
      }
    });
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
    if(isSecretRoute()){
      showAdminOverlay();
      return;
    }
    if(!state.owner){
      annotateAdminElements();
    }
    syncViewState();
  }

  function init(){
    if(state.initDone) return;
    state.initDone = true;
    const style = document.createElement('style');
    style.textContent = `.${ADMIN_CLASS}{display:none !important;} body.${OWNER_CLASS} .${ADMIN_CLASS}{display:initial !important;}`;
    document.head.appendChild(style);
    ensureObserver();
    interceptClicks();
    initBackupPanel();
    checkStoredOwner();
    annotateAdminElements();
    enhanceUI();
    handleNavigation();
  }

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('popstate', handleNavigation);
  window.addEventListener('hashchange', handleNavigation);
  document.addEventListener(OWNER_EVENT, () => {
    annotateAdminElements();
    enhanceUI();
    syncViewState();
  });

  if(document.readyState === 'interactive' || document.readyState === 'complete'){
    init();
  }
})();
