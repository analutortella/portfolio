/* =========================================================
   Portfólio Analu Tortella · scripts da home
   Sem dependências. Cada módulo inicializa só se o elemento existir.
   ========================================================= */

const WEB3FORMS_ACCESS_KEY = '3ee62756-6f04-4a7e-8e1f-34d6ec1527d6';

const CONFIG = {
  showreelEmbedUrl: 'https://www.youtube.com/embed/9iGIQwaVZ3U'
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Modal de contato ---------- */
function initContactModal() {
  const modal = document.getElementById('contact-modal');
  const form = document.getElementById('contact-form');
  const formContainer = modal?.querySelector('[data-contact-form-container]');
  const successContainer = modal?.querySelector('[data-contact-success]');
  const successMessage = modal?.querySelector('[data-contact-success-message]');
  const status = modal?.querySelector('[data-contact-status]');
  const submitButton = modal?.querySelector('.contact-form__submit');
  const emailLink = modal?.querySelector('[data-contact-email]');
  const copyButton = modal?.querySelector('[data-copy-email]');
  const copyStatus = modal?.querySelector('[data-copy-status]');
  if (!modal || !form || !formContainer || !successContainer || !successMessage ||
      !status || !submitButton || !emailLink || !copyButton || !copyStatus ||
      typeof modal.showModal !== 'function') return;

  const contactEmail = 'anatortella' + '@' + 'gmail.com';
  const originalSubmitLabel = submitButton.textContent;
  const openers = document.querySelectorAll('[data-open-contact]');
  const closers = modal.querySelectorAll('[data-close-contact]');
  const honeypot = form.elements.namedItem('botcheck');
  let activeOpener = null;
  let previousBodyOverflow = '';

  form.elements.namedItem('access_key').value = WEB3FORMS_ACCESS_KEY;
  emailLink.href = `mailto:${contactEmail}`;
  emailLink.textContent = contactEmail;

  const finishClose = () => {
    modal.close();
  };

  const close = () => {
    if (prefersReducedMotion) {
      finishClose();
      return;
    }
    modal.classList.add('is-closing');
  };

  const open = (event) => {
    if (modal.open) return;
    activeOpener = event.currentTarget;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal.classList.remove('is-closing');
    status.textContent = '';
    copyStatus.textContent = '';
    modal.showModal();
    form.elements.namedItem('name').focus();
  };

  openers.forEach((button) => button.addEventListener('click', open));
  closers.forEach((button) => button.addEventListener('click', close));

  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  modal.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  modal.addEventListener('animationend', (event) => {
    if (event.target === modal && event.animationName === 'contact-modal-out' && modal.open) {
      finishClose();
    }
  });

  modal.addEventListener('close', () => {
    modal.classList.remove('is-closing');
    document.body.style.overflow = previousBodyOverflow;
    formContainer.hidden = false;
    successContainer.hidden = true;
    successMessage.textContent = '';
    status.textContent = '';
    if (activeOpener?.isConnected) activeOpener.focus();
    activeOpener = null;
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusableElements = [...modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), a[href]'
    )].filter((element) => element.getClientRects().length > 0);
    if (!focusableElements.length) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

  const showCopyFeedback = (message) => {
    copyStatus.textContent = message;
  };

  const copyWithFallback = () => {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = contactEmail;
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.className = 'visually-hidden';
    document.body.append(temporaryInput);
    temporaryInput.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    } finally {
      temporaryInput.remove();
    }
    showCopyFeedback(copied ? 'Copiado!' : 'Não foi possível copiar. Selecione o e-mail acima.');
  };

  copyButton.addEventListener('click', async () => {
    copyStatus.textContent = '';
    if (!navigator.clipboard?.writeText) {
      copyWithFallback();
      return;
    }
    try {
      await navigator.clipboard.writeText(contactEmail);
      showCopyFeedback('Copiado!');
    } catch {
      copyWithFallback();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (honeypot.checked) return;

    const formData = new FormData(form);
    const name = formData.get('name').toString().trim();
    const payload = Object.fromEntries(formData.entries());
    payload.subject = `Novo contato pelo portfólio: ${name}`;
    payload.from_name = 'Portfólio Analu Tortella';
    payload.access_key = WEB3FORMS_ACCESS_KEY;

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando…';
    submitButton.setAttribute('aria-busy', 'true');
    status.textContent = '';

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        status.textContent = 'Não foi possível enviar agora.';
        return;
      }

      form.reset();
      form.elements.namedItem('access_key').value = WEB3FORMS_ACCESS_KEY;
      formContainer.hidden = true;
      successContainer.hidden = false;
      successMessage.textContent = 'Mensagem enviada! A Analu vai responder em breve.';
      successContainer.querySelector('[data-close-contact]').focus();
    } catch {
      status.textContent = 'Não foi possível enviar agora.';
    } finally {
      window.clearTimeout(timeoutId);
      submitButton.disabled = false;
      submitButton.textContent = originalSubmitLabel;
      submitButton.removeAttribute('aria-busy');
    }
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
  initContactModal();
  initNav();
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  initHeroAudio();
  initShowreel();
  initYear();
});
