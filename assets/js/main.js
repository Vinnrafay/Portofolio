/* main.js - shared utils: theme, language, toast, mobile menu, scroll progress (Fase 2.2) */

// 1. Pengalih Tema (Dark / Light)
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
  setLanguage(currentLang);
}

function updateThemeIcons(isDark) {
  const sun = document.getElementById('themeIconSun');
  const moon = document.getElementById('themeIconMoon');
  const sunM = document.getElementById('themeIconSunM');
  const moonM = document.getElementById('themeIconMoonM');

  [[sun, moon], [sunM, moonM]].forEach(([s, m]) => {
    if (!s || !m) return;
    if (isDark) {
      s.classList.remove('hidden');
      m.classList.add('hidden');
    } else {
      s.classList.add('hidden');
      m.classList.remove('hidden');
    }
  });
}
updateThemeIcons(document.documentElement.classList.contains('dark'));

// 2. Sistem Terjemahan Bahasa (ID / EN)
let currentLang = localStorage.getItem('portfolio-lang') || 'id';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('portfolio-lang', lang);
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-lang]').forEach((el) => {
    if (el.getAttribute('data-lang') === lang) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  const pairs = [
    ['lang-id', 'lang-en'],
    ['lang-id-m', 'lang-en-m'],
  ];

  pairs.forEach(([idBtn, enBtn]) => {
    const bId = document.getElementById(idBtn);
    const bEn = document.getElementById(enBtn);
    if (!bId || !bEn) return;

    const isDark = document.documentElement.classList.contains('dark');
    const activeClass = isDark
      ? 'px-2.5 py-1 rounded-full font-bold transition-all bg-zinc-800 text-white shadow-sm'
      : 'px-2.5 py-1 rounded-full font-bold transition-all bg-white text-zinc-950 shadow-sm';
    const inactiveClass = 'px-2.5 py-1 rounded-full text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all font-semibold';

    if (lang === 'id') {
      bId.className = activeClass;
      bEn.className = inactiveClass;
      bId.setAttribute('aria-pressed', 'true');
      bEn.setAttribute('aria-pressed', 'false');
    } else {
      bId.className = inactiveClass;
      bEn.className = activeClass;
      bId.setAttribute('aria-pressed', 'false');
      bEn.setAttribute('aria-pressed', 'true');
    }
  });
}
setLanguage(currentLang);

// 5. Toast Salin Teks
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
let toastTimeout;

function showToast(msg) {
  clearTimeout(toastTimeout);
  toastMessage.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function copyToClipboard(text, label) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Berhasil menyalin ${label}!`);
    }).catch(() => {
      showToast(`Gagal menyalin ${label}.`);
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(`Berhasil menyalin ${label}!`);
    } catch {
      showToast(`Gagal menyalin ${label}.`);
    }
    document.body.removeChild(textarea);
  }
}

// 6. Scroll Progress (fallback + non-Lenis)
window.addEventListener('scroll', () => {
  const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  const progress = document.getElementById('scrollProgress');
  if (progress) progress.style.width = scrolled + '%';
});

// 7. Menu Mobile
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    const open = !mobileMenu.classList.contains('hidden');
    mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('hidden');
  mobileMenu.classList.remove('flex');
  if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
}

// ESC menutup menu mobile (Fase 4.3)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
    closeMobileMenu();
    if (mobileMenuBtn) mobileMenuBtn.focus();
  }
});

// 8. Event Delegation (pengganti onclick, Fase 2.3)
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.getAttribute('data-action');

  if (action === 'set-lang') {
    setLanguage(el.getAttribute('data-lang') || 'id');
  } else if (action === 'toggle-theme') {
    toggleTheme();
  } else if (action === 'close-menu') {
    closeMobileMenu();
  } else if (action === 'copy') {
    copyToClipboard(el.getAttribute('data-text') || '', el.getAttribute('data-label') || 'teks');
  }
});
