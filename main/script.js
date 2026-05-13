'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // =============================================================
  // NAV — scroll-active state
  // =============================================================
  const siteNav = document.getElementById('site-nav');

  const handleNavScroll = () => {
    if (window.scrollY > 10) {
      siteNav.classList.add('nav-scrolled');
    } else {
      siteNav.classList.remove('nav-scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  // Run once on load in case page is loaded mid-scroll
  handleNavScroll();

  // =============================================================
  // MOBILE MENU — hamburger toggle
  // =============================================================
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    hamburgerIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close navigation menu');
  };

  const closeMenu = () => {
    mobileMenu.classList.add('hidden');
    hamburgerIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation menu');
  };

  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close mobile menu when a link is clicked
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // =============================================================
  // PHONE — intl-tel-input initialization
  // =============================================================
  const phoneInputEl = document.getElementById('phone-input');
  const phoneHidden = document.getElementById('phone-hidden');
  let iti = null;

  if (phoneInputEl && typeof intlTelInput !== 'undefined') {
    iti = intlTelInput(phoneInputEl, {
      initialCountry: 'my',
      separateDialCode: true,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.1.0/build/js/utils.js',
    });
  }

  // =============================================================
  // CONTACT FORM — dynamic email subject builder
  // =============================================================
  const packageSelect = document.getElementById('package_interest');
  const nameInput = document.getElementById('name');
  const businessNameInput = document.getElementById('business_name');
  const formSubject = document.getElementById('form-subject');

  const rebuildSubject = () => {
    const packageVal = packageSelect ? packageSelect.value : '';
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const businessVal = businessNameInput ? businessNameInput.value.trim() : '';

    const isBlankPackage = !packageVal;
    const packageLabel = isBlankPackage ? 'General Enquiry' : packageVal;

    const hasName = nameVal.length > 0;
    const hasBusiness = businessVal.length > 0;

    let subject = `New Enquiry - ${packageLabel}`;
    if (hasName) subject += ` | ${nameVal}`;
    if (hasBusiness) subject += ` | ${businessVal}`;

    // If no meaningful input yet, fall back to default
    if (isBlankPackage && !hasName && !hasBusiness) {
      subject = 'New Enquiry | Paeveul Web Services';
    }

    if (formSubject) formSubject.value = subject;
  };

  if (nameInput) nameInput.addEventListener('input', rebuildSubject);
  if (businessNameInput) businessNameInput.addEventListener('input', rebuildSubject);
  if (packageSelect) packageSelect.addEventListener('change', rebuildSubject);

  // =============================================================
  // CONTACT FORM — validation helpers
  // =============================================================
  const setError = (inputEl, errorEl, message) => {
    inputEl.classList.add('border-error');
    inputEl.classList.remove('border-border-default');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  };

  const clearError = (inputEl, errorEl) => {
    inputEl.classList.remove('border-error');
    inputEl.classList.add('border-border-default');
    errorEl.classList.add('hidden');
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = () => {
    let valid = true;

    const nameEl = document.getElementById('name');
    const nameErr = document.getElementById('name-error');
    if (!nameEl.value.trim()) {
      setError(nameEl, nameErr, 'Please enter your name.'); valid = false;
    } else { clearError(nameEl, nameErr); }

    const bizEl = document.getElementById('business_name');
    const bizErr = document.getElementById('business-name-error');
    if (!bizEl.value.trim()) {
      setError(bizEl, bizErr, 'Please enter your business name.'); valid = false;
    } else { clearError(bizEl, bizErr); }

    const emailEl = document.getElementById('email');
    const emailErr = document.getElementById('email-error');
    if (!emailEl.value.trim() || !emailRegex.test(emailEl.value.trim())) {
      setError(emailEl, emailErr, 'Please enter a valid email address.'); valid = false;
    } else { clearError(emailEl, emailErr); }

    const phoneErr = document.getElementById('phone-error');
    if (!iti || !iti.isValidNumber()) {
      setError(phoneInputEl, phoneErr, 'Please enter a valid phone number.'); valid = false;
    } else { clearError(phoneInputEl, phoneErr); }

    const locationEl = document.getElementById('location');
    const locationErr = document.getElementById('location-error');
    if (!locationEl.value.trim()) {
      setError(locationEl, locationErr, 'Please tell us where you\'re based.'); valid = false;
    } else { clearError(locationEl, locationErr); }

    const pkgErr = document.getElementById('package-error');
    if (!packageSelect.value) {
      setError(packageSelect, pkgErr, 'Please select a package.'); valid = false;
    } else { clearError(packageSelect, pkgErr); }

    const msgEl = document.getElementById('message');
    const msgErr = document.getElementById('message-error');
    if (!msgEl.value.trim()) {
      setError(msgEl, msgErr, 'Please tell us about your business.'); valid = false;
    } else { clearError(msgEl, msgErr); }

    return valid;
  };

  // Clear errors on input
  ['name', 'business_name', 'email', 'location', 'message'].forEach((id) => {
    const el = document.getElementById(id);
    const errId = { name: 'name-error', business_name: 'business-name-error', email: 'email-error', location: 'location-error', message: 'message-error' }[id];
    if (el) el.addEventListener('input', () => clearError(el, document.getElementById(errId)));
  });
  if (phoneInputEl) phoneInputEl.addEventListener('input', () => clearError(phoneInputEl, document.getElementById('phone-error')));
  if (packageSelect) packageSelect.addEventListener('change', () => clearError(packageSelect, document.getElementById('package-error')));

  // =============================================================
  // CONTACT FORM — Web3Forms submission
  // =============================================================
  const contactForm = document.getElementById('contact-form');
  const contactFormWrapper = document.getElementById('contact-form-wrapper');
  const formSuccess = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      // Loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      // Populate full international phone number before FormData is built
      if (iti && phoneHidden) {
        phoneHidden.value = iti.getNumber();
      }

      const formData = new FormData(contactForm);
      const object = Object.fromEntries(formData.entries());
      const json = JSON.stringify(object);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: json,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // GA4 event — form submission success
          gtag('event', 'form_submit', {
            event_category: 'contact_form',
            event_label: 'enquiry_sent',
          });

          // Show success state
          contactFormWrapper.classList.add('hidden');
          formSuccess.classList.remove('hidden');
          formSuccess.classList.add('is-visible');
        } else {
          // Restore button on failure
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Enquiry';
          console.error('Form submission error:', result);
          alert('Something went wrong. Please try again or email us directly at paeveul.official@gmail.com');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Enquiry';
        console.error('Network error:', err);
        alert('Unable to send. Please check your connection or email us at paeveul.official@gmail.com');
      }
    });
  }

  // =============================================================
  // GA4 EVENTS — email clicks (non-footer, in-page links)
  // =============================================================
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach((link) => {
    // Footer email already has inline onclick — skip double-firing
    // by only attaching to links without an existing onclick attribute
    if (!link.hasAttribute('onclick')) {
      link.addEventListener('click', () => {
        gtag('event', 'email_click', {
          event_category: 'engagement',
          link_url: link.href,
        });
      });
    }
  });

  // =============================================================
  // PACKAGE CARDS — hover sibling state (dim Professional when sibling hovered)
  // =============================================================
  const packageCards = document.querySelectorAll('.package-card');
  const professionalCard = document.querySelector('.package-card[data-package="Professional"]');

  if (packageCards.length > 0 && professionalCard) {
    packageCards.forEach((card) => {
      if (card === professionalCard) return;

      card.addEventListener('mouseenter', () => {
        professionalCard.classList.add('sibling-hovered');
      });

      card.addEventListener('mouseleave', () => {
        professionalCard.classList.remove('sibling-hovered');
      });
    });

    // Also remove sibling-hovered if the Professional card itself is hovered
    professionalCard.addEventListener('mouseenter', () => {
      professionalCard.classList.remove('sibling-hovered');
    });
  }

  // =============================================================
  // GA4 EVENTS — package_view (Intersection Observer)
  // =============================================================
  const viewedPackages = new Set();

  if (packageCards.length > 0 && 'IntersectionObserver' in window) {
    const packageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const packageName = entry.target.dataset.package;
            if (packageName && !viewedPackages.has(packageName)) {
              viewedPackages.add(packageName);
              gtag('event', 'package_view', {
                event_category: 'packages',
                package_name: packageName,
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    packageCards.forEach((card) => packageObserver.observe(card));
  }

  // =============================================================
  // SCROLL ANIMATIONS — Intersection Observer fade-up / fade-in
  // =============================================================
  const animatedEls = document.querySelectorAll('.fade-up, .fade-in');

  let animObserver = null;

  if (animatedEls.length > 0 && 'IntersectionObserver' in window) {
    animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            animObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedEls.forEach((el) => animObserver.observe(el));
  } else {
    // Fallback: show all elements without animation
    animatedEls.forEach((el) => el.classList.add('is-visible'));
  }

  // =============================================================
  // PORTFOLIO STRIP — drag to scroll
  // =============================================================
  const portfolioStrip = document.getElementById('portfolio-strip');

  if (portfolioStrip) {
    let isDown = false;
    let startX;
    let scrollLeft;

    portfolioStrip.addEventListener('mousedown', (e) => {
      isDown = true;
      portfolioStrip.classList.add('is-dragging');
      startX = e.pageX - portfolioStrip.offsetLeft;
      scrollLeft = portfolioStrip.scrollLeft;
    });

    portfolioStrip.addEventListener('mouseleave', () => {
      isDown = false;
      portfolioStrip.classList.remove('is-dragging');
    });

    portfolioStrip.addEventListener('mouseup', () => {
      isDown = false;
      portfolioStrip.classList.remove('is-dragging');
    });

    portfolioStrip.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - portfolioStrip.offsetLeft;
      const walk = (x - startX) * 1.5;
      portfolioStrip.scrollLeft = scrollLeft - walk;
    });
  }

  // =============================================================
  // NAV LINK CLICKS — reset animations in target section
  // =============================================================
  const allNavLinks = document.querySelectorAll('a[href^="#"]');

  allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (!animObserver) return;

      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;

      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      const sectionAnimEls = targetSection.querySelectorAll('.fade-up, .fade-in');
      sectionAnimEls.forEach((el) => {
        el.classList.remove('is-visible');
        animObserver.observe(el);
      });
    });
  });

});
