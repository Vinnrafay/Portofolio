/* home.js - page-specific: lenis, AOS, anchors, projects, lightbox, dialog, piastri (Fase 2.2) */

// ==========================================
// SMOOTH SCROLLING (KHUSUS PC, MATI DI MOBILE)
// ==========================================
let lenisInstance = null;
if (typeof Lenis !== 'undefined' && window.matchMedia('(min-width: 768px) and (pointer: fine)').matches && !('ontouchstart' in window)) {
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 0,
  });
  window.lenis = lenisInstance;

  function raf(time) {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Hubungkan ke Scroll Progress Bar (tanpa AOS.refresh tiap frame — mahal)
  lenisInstance.on('scroll', () => {
    const winScroll = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progress = document.getElementById('scrollProgress');
    if (progress) progress.style.width = scrolled + '%';
  });
}

// ==========================================
// INISIALISASI AOS ANIMATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      duration: 700,
      easing: 'ease-out-cubic',
      offset: 80,
    });
  } else {
    // Fallback: lib gagal dimuat (mis. diblokir) — tampilkan konten langsung
    document.querySelectorAll('[data-aos]').forEach((el) => el.classList.add('aos-animate'));
  }
});

// ==========================================
// SMOOTH SCROLLING NAVBAR / ANCHOR CLICKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    // Jika PC dan Lenis aktif
    if (window.lenis) {
      window.lenis.scrollTo(targetEl, { offset: -40, duration: 1.2 });
    } else {
      // Fallback / Mobile: Smooth scroll terarah dengan offset navbar floating
      const navOffset = 64;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  });
});

// ==========================================
// CONTROLLER PREVIEW: HERO COVER VS NORMAL UI
// ==========================================
function swapProjectImage(targetImgId, newSrc, newCaption, clickedThumb, mode = 'cover') {
  const mainImg = document.getElementById(targetImgId);
  if (!mainImg) return;

  mainImg.style.opacity = '0.35';

  setTimeout(() => {
    mainImg.src = newSrc;
    mainImg.setAttribute('data-caption', newCaption);

    if (mode === 'contain') {
      mainImg.className = 'w-full h-full object-contain p-2 sm:p-4 select-none group-hover:scale-[1.01] transition-all duration-300';
    } else {
      mainImg.className = 'w-full h-full object-cover select-none group-hover:scale-[1.02] transition-all duration-300';
    }

    mainImg.style.opacity = '1';
  }, 100);

  const container = clickedThumb.parentElement;
  if (container) {
    container.querySelectorAll('.thumb-btn').forEach((btn) => {
      btn.className = 'thumb-btn w-16 h-11 sm:w-20 sm:h-12 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 opacity-40 hover:opacity-90 shrink-0 transition-all active:scale-95';
    });
    clickedThumb.className = 'thumb-btn w-16 h-11 sm:w-20 sm:h-12 rounded-xl overflow-hidden border-2 border-zinc-950 dark:border-white opacity-100 shrink-0 transition-all active:scale-95 shadow-xs';
  }
}

// Buka Lightbox Gambar yang Sedang Aktif
function openCurrentProjectImage(imgId) {
  const imgEl = document.getElementById(imgId);
  if (!imgEl) return;
  const src = imgEl.src;
  const caption = imgEl.getAttribute('data-caption') || imgEl.alt;
  if (typeof openLightbox === 'function') {
    openLightbox(src, caption);
  }
}

// Filter Tab Pills Kategori
function filterProjects(category) {
  const cards = document.querySelectorAll('.project-featured-card');
  cards.forEach((card) => {
    if (category === 'all' || card.getAttribute('data-category') === category) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  const buttons = ['all', 'ui', 'web', 'game'];
  buttons.forEach((btn) => {
    const el = document.getElementById(`filter-${btn}`);
    if (!el) return;
    if (btn === category) {
      el.className = 'px-4 py-1.5 text-xs font-semibold rounded-full bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 transition-all whitespace-nowrap shadow-xs';
      el.setAttribute('aria-pressed', 'true');
    } else {
      el.className = 'px-4 py-1.5 text-xs font-semibold rounded-full border border-zinc-300 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all whitespace-nowrap';
      el.setAttribute('aria-pressed', 'false');
    }
  });

  if (typeof AOS !== 'undefined') {
    setTimeout(() => AOS.refresh(), 50);
  }
}

// 4. Modal Lightbox
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

// Scroll-lock + Lenis pause saat modal terbuka (Fase 4.2)
let scrollLockCount = 0;
function lockScroll() {
  scrollLockCount += 1;
  if (scrollLockCount === 1) {
    document.body.style.overflow = 'hidden';
    if (window.lenis && typeof window.lenis.stop === 'function') window.lenis.stop();
  }
}
function unlockScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.overflow = '';
    if (window.lenis && typeof window.lenis.start === 'function') window.lenis.start();
  }
}

// Focus-trap sederhana: Tab berputar di dalam modal (Fase 4.2)
function trapTab(e, container) {
  if (e.key !== 'Tab') return;
  const focusables = container.querySelectorAll(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function isModalOpen(modal) {
  return modal && !modal.classList.contains('hidden');
}

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxCaption.textContent = caption;
  lightboxModal.classList.remove('hidden');
  lightboxModal.classList.add('flex');
  lockScroll();
  const closeBtn = document.getElementById('lightboxCloseBtn');
  if (closeBtn) closeBtn.focus();
}

function closeLightbox() {
  if (!isModalOpen(lightboxModal)) return;
  lightboxModal.classList.add('hidden');
  lightboxModal.classList.remove('flex');
  unlockScroll();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeLinkDialog();
  }
  if (isModalOpen(lightboxModal)) trapTab(e, lightboxModal);
  const dialog = document.getElementById('alertDialogModal');
  if (isModalOpen(dialog)) trapTab(e, dialog);
});

// ==========================================
// ALERT DIALOG CONTROLLER (FLEXIBLE TEXT)
// ==========================================
function openLinkDialog(params) {
  const modal = document.getElementById('alertDialogModal');
  const titleEl = document.getElementById('alertTitle');
  const msgEl = document.getElementById('alertMessage');
  const confirmBtn = document.getElementById('alertConfirmBtn');
  const cancelBtn = document.getElementById('alertCancelBtn');

  if (!modal || !confirmBtn) return;

  // Mendukung input objek: { url, title, description, confirmText, cancelText }
  const url = typeof params === 'object' ? params.url : params;
  const title = typeof params === 'object' ? params.title : arguments[1];
  const desc = typeof params === 'object' ? params.description : arguments[2];
  const confirmText = (typeof params === 'object' && params.confirmText) ? params.confirmText : 'Continue';
  const cancelText = (typeof params === 'object' && params.cancelText) ? params.cancelText : 'Cancel';

  if (titleEl) titleEl.textContent = title || 'Are you absolutely sure?';
  if (msgEl) msgEl.innerHTML = desc || 'This action will take you to an external destination.';
  if (confirmBtn) {
    confirmBtn.href = url || '#';
    confirmBtn.textContent = confirmText;
  }
  if (cancelBtn) cancelBtn.textContent = cancelText;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  lockScroll();
  if (cancelBtn) cancelBtn.focus();
}

function closeLinkDialog() {
  const modal = document.getElementById('alertDialogModal');
  if (!modal || !isModalOpen(modal)) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  unlockScroll();
}

// Konfigurasi dialog tautan eksternal (pengganti object literal di onclick, Fase 2.3)
const LINK_DIALOGS = {
  pandu: {
    url: 'https://halopandu.vercel.app',
    title: 'Buka HaloPandu?',
    description: 'Kamu akan diarahkan ke website demo Pandu. Semua ini masih dalam testing dan akan dilanjutkan nanti. Apakah kamu yakin ingin melanjutkan?',
    confirmText: 'Buka Website',
    cancelText: 'Batal',
  },
  roblox: {
    url: 'https://www.roblox.com/communities/403281622/Dicesides',
    title: 'Kunjungi DiceSides?',
    description: 'Kamu akan diarahkan ke halaman komunitas DiceSides. Untuk saat ini sedang dalam pengembangan untuk gamenya yaitu <b>OPTION 2</b>. Tetapi ini adalah tempat dimana saya akan merilis proyek game saya.',
    confirmText: 'Buka Roblox',
    cancelText: 'Kembali',
  },
  option: {
    url: 'https://www.roblox.com/games/83096157775144/OPTION',
    title: 'Buka halaman OPTION?',
    description: 'Game ini di develop di 2024, dengan konsep untuk <b>tugas sekolah</b>. Game ini sangat unoptimized dan juga banyak bugnya sehingga tidak ada kelanjutkan development atau sudah di Discontinued. Tetapi kalau ingin Memainkannya silahkan <i>join</i> Averys Home. Karena dibatasi untuk yang join grupnya saja.',
    confirmText: 'Mainkan Game',
    cancelText: 'Nanti Dulu',
  },
};

// Event Delegation halaman home (pengganti onclick, Fase 2.3)
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.getAttribute('data-action');

  if (action === 'filter') {
    filterProjects(el.getAttribute('data-filter') || 'all');
  } else if (action === 'open-dialog') {
    const cfg = LINK_DIALOGS[el.getAttribute('data-dialog')];
    if (cfg) openLinkDialog(cfg);
  } else if (action === 'open-project-img') {
    openCurrentProjectImage(el.getAttribute('data-img'));
  } else if (action === 'swap-img') {
    swapProjectImage(
      el.getAttribute('data-target'),
      el.getAttribute('data-src'),
      el.getAttribute('data-caption'),
      el,
      el.getAttribute('data-mode') || 'cover'
    );
  } else if (action === 'open-lightbox') {
    openLightbox(el.getAttribute('data-src'), el.getAttribute('data-caption'));
  } else if (action === 'close-lightbox') {
    closeLightbox();
  } else if (action === 'stop-prop') {
    e.stopPropagation();
  } else if (action === 'close-dialog') {
    closeLinkDialog();
  }
});

// Aksesibilitas kartu klik (Fase 4.3): label thumb + keyboard untuk kartu non-button
document.querySelectorAll('[data-action="swap-img"]').forEach((btn) => {
  if (!btn.getAttribute('aria-label') && btn.getAttribute('data-caption')) {
    btn.setAttribute('aria-label', `Lihat ${btn.getAttribute('data-caption')}`);
  }
});

document.querySelectorAll('[data-action="open-lightbox"], [data-action="open-project-img"]').forEach((card) => {
  const tag = card.tagName;
  if (tag !== 'BUTTON' && tag !== 'A') {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest ? e.target.closest('[data-action="open-lightbox"], [data-action="open-project-img"]') : null;
  if (!el) return;
  const tag = el.tagName;
  if (tag === 'BUTTON' || tag === 'A') return;
  e.preventDefault();
  el.click();
});

// ==========================================
// TECH MARQUEE (data-driven, Fase 2.4, visual-identical)
// ==========================================
const TECH_ROW_1 = [
  ['html', 'HTML5'],
  ['css', 'CSS3'],
  ['js', 'JavaScript'],
  ['ts', 'TypeScript'],
  ['php', 'PHP'],
  ['laravel', 'Laravel'],
  ['react', 'React'],
  ['nextjs', 'Next.js'],
  ['tailwind', 'Tailwind'],
  ['mysql', 'MySQL'],
  ['lua', 'Luau'],
];

const TECH_ROW_2 = [
  ['figma', 'Figma'],
  ['git', 'Git'],
  ['github', 'GitHub'],
  ['vscode', 'VS Code'],
  ['npm', 'npm'],
  ['vite', 'Vite'],
  ['vercel', 'Vercel'],
  ['postman', 'Postman'],
  ['supabase', 'Supabase'],
  ['bootstrap', 'Bootstrap'],
  ['nodejs', 'Node.js'],
];

function renderMarquee(rowId, items) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const makeSet = (hidden) => {
    const set = document.createElement('div');
    set.className = 'flex items-center gap-3 shrink-0';
    if (hidden) set.setAttribute('aria-hidden', 'true');

    items.forEach(([icon, label]) => {
      const badge = document.createElement('div');
      badge.className = 'flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 hover:-translate-y-0.5 transition-all duration-150';

      const img = document.createElement('img');
      img.src = `assets/icons/${icon}.svg`;
      img.alt = hidden ? '' : label;
      img.className = 'w-6 h-6 rounded-md object-contain';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = 24;
      img.height = 24;

      const span = document.createElement('span');
      span.className = 'text-xs font-semibold text-zinc-800 dark:text-zinc-200';
      span.textContent = label;

      badge.appendChild(img);
      badge.appendChild(span);
      set.appendChild(badge);
    });

    return set;
  };

  row.appendChild(makeSet(false));
  row.appendChild(makeSet(true));
}

renderMarquee('marqueeRow1', TECH_ROW_1);
renderMarquee('marqueeRow2', TECH_ROW_2);

// Rotasi Gambar Nomor Oscar Piastri (tiap 10 Detik, pause saat tab hidden)
(function () {
  const piastriImg = document.getElementById('piastriNumber');
  if (!piastriImg) return;

  const numbers = [
    'assets/OP81.webp',
    'assets/OP81-2.webp',
  ];
  let currentIdx = 0;

  numbers.forEach((src) => {
    const preloader = new Image();
    preloader.src = src;
  });

  setInterval(() => {
    if (document.hidden) return;
    piastriImg.classList.add('opacity-0');

    setTimeout(() => {
      currentIdx = (currentIdx + 1) % numbers.length;
      piastriImg.src = numbers[currentIdx];
      piastriImg.classList.remove('opacity-0');
    }, 500);
  }, 10000);
})();
