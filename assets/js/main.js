/* =========================================================
   Portfólio Analu Tortella · scripts da home
   Sem dependências. Cada módulo inicializa só se o elemento existir.
   ========================================================= */

const CONFIG = {
  whatsappNumber: '5511939119422',           // DDI + DDD + número, só dígitos
  whatsappGreeting: 'Olá, Analu! Vi seu portfólio e quero conversar sobre um freela.',
  showreelEmbedUrl: 'https://www.youtube.com/embed/9iGIQwaVZ3U'
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- WhatsApp ---------- */
function buildWhatsAppUrl(message) {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function initWhatsAppLinks() {
  const url = buildWhatsAppUrl(CONFIG.whatsappGreeting);
  document.querySelectorAll('.js-whatsapp').forEach((link) => {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

function initBriefForm() {
  const form = document.getElementById('brief-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const formato = (data.get('formato') || '').toString().trim();
    const prazo = (data.get('prazo') || '').toString().trim();
    const descricao = (data.get('descricao') || '').toString().trim();

    const lines = ['Olá, Analu! Vi seu portfólio e gostaria de conversar a respeito.'];
    if (formato) lines.push(`Formato: ${formato}`);
    if (prazo) lines.push(`Prazo: ${prazo}`);
    if (descricao) lines.push(`Projeto: ${descricao}`);

    window.open(buildWhatsAppUrl(lines.join('\n')), '_blank', 'noopener');
  });
}

/* ---------- Menu mobile ---------- */
function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------- Carrossel ---------- */
function initCarousel(root) {
  const track = root.querySelector('.carousel__track');
  const bar = root.querySelector('[data-carousel-bar]');
  const section = root.closest('section, .band') || document;
  const prev = section.querySelector('[data-carousel-prev]');
  const next = section.querySelector('[data-carousel-next]');
  if (!track) return;

  const behavior = prefersReducedMotion ? 'auto' : 'smooth';
  const step = () => {
    const card = track.querySelector('.reel, .carousel__card');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16;
    const cardWidth = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    // Avança quantos cards inteiros couberem na área visível (mínimo 1)
    return Math.max(1, Math.floor(track.clientWidth / cardWidth)) * cardWidth;
  };

  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const pos = track.scrollLeft;
    if (prev) prev.disabled = pos <= 2;
    if (next) next.disabled = pos >= max - 2;
    if (bar) {
      const visible = track.clientWidth / track.scrollWidth;
      const progress = max > 0 ? pos / max : 0;
      bar.style.width = `${Math.max(visible * 100, 8)}%`;
      bar.style.transform = `translateX(${progress * (1 / visible - 1) * 100}%)`;
    }
  };

  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior }));

  // Setas do teclado quando o carrossel está em foco
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); track.scrollBy({ left: step(), behavior }); }
    if (event.key === 'ArrowLeft')  { event.preventDefault(); track.scrollBy({ left: -step(), behavior }); }
  });

  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- Áudio do showreel no hero ---------- */
function initHeroAudio() {
  const iframe = document.querySelector('.hero__video--embed');
  const toggle = document.querySelector('[data-hero-audio]');
  if (!iframe || !toggle) return;

  let muted = true;
  const render = () => {
    const label = muted ? 'Ativar som' : 'Desativar som';
    toggle.setAttribute('aria-pressed', String(!muted));
    toggle.setAttribute('aria-label', label);
    toggle.innerHTML = muted
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m23 9-6 6m0-6 6 6"/></svg>Ativar som'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>Desativar som';
  };
  const syncPlayer = () => {
    iframe.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: muted ? 'mute' : 'unMute', args: [] }),
      'https://www.youtube.com'
    );
  };

  const embedUrl = new URL(iframe.src);
  embedUrl.searchParams.set('mute', '1');
  embedUrl.searchParams.set('enablejsapi', '1');
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    embedUrl.searchParams.set('origin', window.location.origin);
  }
  iframe.src = embedUrl.toString();
  iframe.addEventListener('load', syncPlayer);
  toggle.addEventListener('click', () => {
    muted = !muted;
    render();
    syncPlayer();
  });
  window.addEventListener('pageshow', () => {
    muted = true;
    render();
    syncPlayer();
  });
  render();
}

/* ---------- Modal do showreel ---------- */
function initShowreel() {
  const modal = document.getElementById('reel-modal');
  const player = modal?.querySelector('[data-reel-player]');
  const openers = document.querySelectorAll('[data-open-reel]');
  if (!modal || !player || typeof modal.showModal !== 'function') return;

  const placeholderHtml = player.innerHTML;

  const open = () => {
    if (CONFIG.showreelEmbedUrl) {
      // O iframe só é criado no clique: a página não carrega o player à toa
      const iframe = document.createElement('iframe');
      const embedUrl = new URL(CONFIG.showreelEmbedUrl);
      embedUrl.searchParams.set('autoplay', '1');
      if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        embedUrl.searchParams.set('origin', window.location.origin);
      }
      iframe.src = embedUrl.toString();
      iframe.title = 'Showreel de Analu Tortella';
      iframe.allow = 'autoplay; picture-in-picture';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      player.replaceChildren(iframe);
    }
    modal.showModal();
  };

  const close = () => modal.close();

  openers.forEach((btn) => btn.addEventListener('click', open));
  modal.querySelector('[data-close-reel]')?.addEventListener('click', close);
  // Clique fora da caixa fecha
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  // Ao fechar, remove o iframe para parar o vídeo
  modal.addEventListener('close', () => { player.innerHTML = placeholderHtml; });
}

/* ---------- Ano no rodapé ---------- */
function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initBriefForm();
  initNav();
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  initHeroAudio();
  initShowreel();
  initYear();
});
