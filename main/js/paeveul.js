/*
 * paeveul.js — Vanilla JS interactive behaviours
 * v2.0: RotatingWord retired. FaqItem, PageHeader mobile menu, lightbox.
 */

/* ─── FAQ Accordion ──────────────────────────────────────────────────────────
 * v2.0: icon is a text +/– character in .pv-faq-icon (cobalt).
 * data-open attribute on .pv-faq-item drives open state.
 *
 * Expects structure:
 *   <div class="pv-faq-item">
 *     <div class="pv-faq-q">
 *       Question text
 *       <span class="pv-faq-icon">+</span>
 *     </div>
 *     <div class="pv-faq-body"><p>Answer text</p></div>
 *   </div>
 */
function initFaqAccordions() {
  document.querySelectorAll('.pv-faq-item').forEach(item => {
    const trigger = item.querySelector('.pv-faq-q');
    const body    = item.querySelector('.pv-faq-body');
    const icon    = item.querySelector('.pv-faq-icon');
    if (!trigger || !body) return;

    let open = item.dataset.open === 'true';
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
    if (icon) icon.textContent = open ? '–' : '+';
    item.dataset.open = open;

    trigger.addEventListener('click', () => {
      open = !open;
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      if (icon) icon.textContent = open ? '–' : '+';
      item.dataset.open = open;
      trigger.setAttribute('aria-expanded', open);
    });
  });
}

/* ─── Mobile Menu (page-shell header) ───────────────────────────────────────
 * Expects:
 *   <button class="pg-hamburger"> <span/><span/><span/> </button>
 *   <div class="pg-mobile-menu"> ... </div>
 */
function initMobileMenu() {
  const btn  = document.querySelector('.pg-hamburger');
  const menu = document.querySelector('.pg-mobile-menu');
  if (!btn || !menu) return;

  const bars = btn.querySelectorAll('span');
  let open = false;

  function setOpen(state) {
    open = state;
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    if (bars[0]) bars[0].style.transform = open ? 'rotate(45deg) translate(4px, 4px)' : '';
    if (bars[1]) bars[1].style.opacity   = open ? '0' : '1';
    if (bars[2]) bars[2].style.transform = open ? 'rotate(-45deg) translate(4px, -4px)' : '';
  }

  btn.addEventListener('click', () => setOpen(!open));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}

/* ─── Testimonials Carousel (mobile only — ≤767px) ──────────────────────────
 * Session A stub. Full implementation added in Session B when why.html is rebuilt.
 * On desktop (≥768px) testimonials are a static 3-column CSS grid — no JS needed.
 *
 * Expected structure (why.html):
 *   <div class="why-testi-track">
 *     <figure class="pv-card pv-pullquote-card">…</figure>
 *     …
 *   </div>
 *   <div class="why-carousel-dots">
 *     <button class="why-carousel-dot is-active" aria-label="Slide 1"></button>
 *     …
 *   </div>
 */
function initTestimonialsCarousel() {
  const track = document.querySelector('.why-testi-track');
  if (!track) return; // not on why.html — exit cleanly

  const cards = Array.from(track.querySelectorAll('.pv-pullquote-card'));
  const dots  = Array.from(document.querySelectorAll('.why-carousel-dot'));
  if (!cards.length) return;

  let current = 0;

  function goTo(index) {
    current = index;
    track.scrollTo({ left: cards[index].offsetLeft, behavior: 'smooth' });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
}

/* ─── Boot ───────────────────────────────────────────────────────────────────
 * All initialisers run on DOMContentLoaded.
 * v2.0: RotatingWord retired — removed from boot block.
 * Testimonials carousel is mobile-only (≤767px) — initialised conditionally.
 */
document.addEventListener('DOMContentLoaded', () => {
  initFaqAccordions();
  initMobileMenu();

  // Testimonials carousel — mobile only (≤767px).
  // On desktop (≥768px) the testimonials render as a static CSS grid.
  if (window.matchMedia('(max-width: 767px)').matches) {
    initTestimonialsCarousel();
  }
});

// Article image lightbox
(function () {
  var overlay, lightboxImg;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'ar-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    var closeBtn = document.createElement('button');
    closeBtn.className = 'ar-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close image');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      close();
    });

    lightboxImg = document.createElement('img');
    lightboxImg.addEventListener('click', function (e) { e.stopPropagation(); });

    overlay.appendChild(closeBtn);
    overlay.appendChild(lightboxImg);
    overlay.addEventListener('click', close);
    document.body.appendChild(overlay);
  }

  function open(src, alt) {
    if (!overlay) createOverlay();
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    overlay.style.display = 'flex';
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    setTimeout(function () {
      overlay.style.display = 'none';
      lightboxImg.src = '';
    }, 200);
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var imgs = document.querySelectorAll('.ar-img-wrap img');
    imgs.forEach(function (img) {
      img.addEventListener('click', function () {
        open(img.src, img.alt);
      });
    });
  });
}());

/* ─── Desktop nav magic line ──────────────────────────────────────────────────
 * Appends a sliding underline span (.pg-nav-line) to .pg-nav and slides it
 * between links on mouseenter / mouseleave. Adds .pg-nav--js to suppress the
 * static CSS ::after underline on the active link while JS is running.
 */
(function () {
  var nav = document.querySelector('.pg-nav');
  if (!nav) return;

  var line = document.createElement('span');
  line.className = 'pg-nav-line';
  nav.appendChild(line);
  nav.classList.add('pg-nav--js');

  function positionLine(el) {
    line.style.left = el.offsetLeft + 'px';
    line.style.width = el.offsetWidth + 'px';
    line.style.opacity = '1';
  }

  var active = nav.querySelector('a.is-active');
  if (active) positionLine(active);

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('mouseenter', function () { positionLine(link); });
  });

  nav.addEventListener('mouseleave', function () {
    if (active) {
      positionLine(active);
    } else {
      line.style.opacity = '0';
    }
  });
}());

/* ─── Hero word-cycling crossfade ─────────────────────────────────────────────
 * Cycles .hm-cycle-word elements inside .hm-cycle-wrap every 3 seconds.
 * The visible word is position:relative (natural width); hidden words are
 * position:absolute (zero layout impact).
 */
(function () {
  var words = document.querySelectorAll('.hm-cycle-word');
  if (!words.length) return;
  var current = 0;
  setInterval(function () {
    words[current].classList.remove('is-visible');
    words[current].setAttribute('aria-hidden', 'true');
    words[current].style.position = 'absolute';
    current = (current + 1) % words.length;
    words[current].classList.add('is-visible');
    words[current].removeAttribute('aria-hidden');
    words[current].style.position = 'relative';
  }, 3000);
}());
