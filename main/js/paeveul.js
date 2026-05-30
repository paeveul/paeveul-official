/*
 * paeveul.js — Vanilla JS interactive behaviours
 * Converts: RotatingWord, FaqItem, PageHeader mobile menu from paeveul-shared.jsx + page-shell.jsx
 */

/* ─── Typewriter / RotatingWord ─────────────────────────────────────────────
 * Usage: <span class="pv-rot" data-words='["clarity","intent","purpose"]'></span>
 * Options via data attributes:
 *   data-type-speed   (default 95)
 *   data-delete-speed (default 55)
 *   data-hold-full    (default 1500)
 *   data-hold-empty   (default 280)
 */
function initRotatingWord(el) {
  const words       = JSON.parse(el.dataset.words || '[]');
  const typeSpeed   = parseInt(el.dataset.typeSpeed   ?? 95,   10);
  const deleteSpeed = parseInt(el.dataset.deleteSpeed ?? 55,   10);
  const holdFull    = parseInt(el.dataset.holdFull    ?? 1500, 10);
  const holdEmpty   = parseInt(el.dataset.holdEmpty   ?? 280,  10);

  if (!words.length) return;

  const caret = document.createElement('span');
  caret.className = 'pv-rot-caret';
  el.appendChild(caret);

  let wordIdx = 0;
  let text    = '';
  let mode    = 'typing'; // 'typing' | 'deleting'

  function render() {
    el.childNodes.forEach(n => { if (n !== caret) el.removeChild(n); });
    el.insertBefore(document.createTextNode(text), caret);
  }

  function tick() {
    const word = words[wordIdx];

    if (mode === 'typing') {
      if (text.length < word.length) {
        text = word.slice(0, text.length + 1);
        render();
        const jitter = Math.random() * 40 - 20;
        setTimeout(tick, typeSpeed + jitter);
      } else {
        setTimeout(() => { mode = 'deleting'; tick(); }, holdFull);
      }
    } else {
      if (text.length > 0) {
        text = word.slice(0, text.length - 1);
        render();
        setTimeout(tick, deleteSpeed);
      } else {
        setTimeout(() => {
          wordIdx = (wordIdx + 1) % words.length;
          mode = 'typing';
          tick();
        }, holdEmpty);
      }
    }
  }

  tick();
}

/* ─── FAQ Accordion ──────────────────────────────────────────────────────────
 * Expects structure:
 *   <div class="pv-faq-item">
 *     <div class="pv-faq-q">
 *       Question text
 *       <span class="pv-faq-icon">
 *         <span class="pv-faq-icon-h"></span>
 *         <span class="pv-faq-icon-v"></span>
 *       </span>
 *     </div>
 *     <div class="pv-faq-body"><p>Answer text</p></div>
 *   </div>
 */
function initFaqAccordions() {
  document.querySelectorAll('.pv-faq-item').forEach(item => {
    const trigger = item.querySelector('.pv-faq-q');
    const body    = item.querySelector('.pv-faq-body');
    const iconV   = item.querySelector('.pv-faq-icon-v');
    if (!trigger || !body) return;

    let open = item.dataset.open === 'true';
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';

    trigger.addEventListener('click', () => {
      open = !open;
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0';
      if (iconV) iconV.style.transform = open ? 'scaleY(0)' : 'scaleY(1)';
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

/* ─── Boot ───────────────────────────────────────────────────────────────────
 * All initialisers run on DOMContentLoaded.
 * RotatingWord elements are picked up automatically by [data-words].
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pv-rot[data-words]').forEach(initRotatingWord);
  initFaqAccordions();
  initMobileMenu();
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
