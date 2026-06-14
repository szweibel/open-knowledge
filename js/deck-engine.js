(function() {
  'use strict';

  var slides = Array.from(document.querySelectorAll('.slide'));
  var total = slides.length;
  var current = 0;
  var currentStep = 0; // Track which step is currently visible (0 = none, 1+ = step number)
  var overviewMode = false;
  var announceEl = document.getElementById('slide-announce');

  document.getElementById('nav-total').textContent = total;

  // --- Accessibility: extract slide title from aria-label ---
  function slideTitle(index) {
    var label = slides[index].getAttribute('aria-label');
    return label || ('Slide ' + (index + 1));
  }

  // --- Accessibility: announce slide change to screen readers ---
  function announceSlide(index) {
    if (!announceEl) return;
    announceEl.textContent = slideTitle(index) + ' of ' + total;
  }

  // --- Accessibility: update scrubber ARIA attributes ---
  function updateScrubberAria(index) {
    var scrubber = document.getElementById('scrubber-container');
    if (!scrubber) return;
    scrubber.setAttribute('aria-valuenow', index + 1);
    scrubber.setAttribute('aria-valuemax', total);
    scrubber.setAttribute('aria-valuetext', 'Slide ' + (index + 1) + ' of ' + total);
  }

  // --- Navigation ---
  function goTo(index, instant) {
    if (index < 0 || index >= total) return;
    current = index;

    slides.forEach(function(s, i) {
      if (i === current) {
        s.classList.add('active');
        s.removeAttribute('aria-hidden');
        if (instant) { s.style.transition = 'none'; requestAnimationFrame(function() { s.style.transition = ''; }); }
        // Initialize first step as visible when entering slide
        currentStep = 0;
        if (window.updateCarousels) {
          window.updateCarousels(current, 1); // Show initial carousel state (step 1)
        }
      } else {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
        resetSteps(s);
        resetStream(s);
      }
    });

    // Stream in bullets on active slide
    streamBullets(slides[current]);

    // Update nav
    document.getElementById('nav-current').textContent = current + 1;

    // Update hash
    history.replaceState(null, '', '#' + (current + 1));

    // Hide watermark on title (first) and closing (last) slides
    var logo = document.getElementById('logoWatermark');
    if (current === 0 || current === total - 1) {
      logo.classList.add('hidden');
    } else {
      logo.classList.remove('hidden');
    }

    // Carousel management
    if (window.pauseCarousel) window.pauseCarousel(current === 0 ? 0 : current - 1);
    if (window.startCarousel) window.startCarousel(current);

    // Update scrubber
    if (window.updateScrubber) window.updateScrubber(current, total);

    // Accessibility: announce slide and move focus
    announceSlide(current);
    updateScrubberAria(current);
    if (!instant) {
      slides[current].focus({ preventScroll: true });
    }

    // Show nav briefly
    var nav = document.getElementById('nav-bar');
    nav.classList.add('visible');
    clearTimeout(nav._hideTimeout);
    nav._hideTimeout = setTimeout(function() { nav.classList.remove('visible'); }, 2000);
  }

  // --- Step Reveal ---
  function revealNextStep() {
    var slide = slides[current];
    var hidden = slide.querySelector('.step-hidden:not(.step-visible)');
    if (hidden) {
      hidden.classList.add('step-visible');
      // Track step number and update carousels
      currentStep++;
      if (window.updateCarousels) {
        window.updateCarousels(current, currentStep);
      }
      return true; // consumed the advance
    }
    return false;
  }

  function resetSteps(slideEl) {
    var steps = slideEl.querySelectorAll('[data-step]');
    steps.forEach(function(el) { el.classList.remove('step-visible'); });
    // Reset step counter when navigating away
    if (slideEl === slides[current]) {
      currentStep = 0;
    }
  }

  // --- Stream-in for bullet lists ---
  function streamBullets(slideEl) {
    var items = slideEl.querySelectorAll('.stream-list li');
    items.forEach(function(li, i) {
      li.classList.remove('streamed');
      setTimeout(function() { li.classList.add('streamed'); }, 200 + i * 250);
    });
  }

  function resetStream(slideEl) {
    var items = slideEl.querySelectorAll('.stream-list li');
    items.forEach(function(li) { li.classList.remove('streamed'); });
  }

  function next() {
    if (!revealNextStep()) goTo(current + 1);
  }
  function prev() { goTo(current - 1); }

  // --- Overview Mode ---
  function toggleOverview() {
    overviewMode = !overviewMode;
    document.body.classList.toggle('overview-mode', overviewMode);

    if (overviewMode) {
      if (announceEl) announceEl.textContent = 'Slide overview: ' + total + ' slides. Click a slide to jump to it, or press Escape to close.';
      requestAnimationFrame(function() {
        slides[current].scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    } else {
      if (announceEl) announceEl.textContent = slideTitle(current) + ' of ' + total;
    }
  }

  // --- Keyboard ---
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { e.preventDefault(); toggleOverview(); return; }
    if (overviewMode) { e.preventDefault(); return; }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
  });

  // --- Touch/Swipe ---
  var touchStartX = 0;
  var touchStartY = 0;
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  // --- Hash routing ---
  function readHash() {
    var h = parseInt(location.hash.replace('#', ''), 10);
    if (h >= 1 && h <= total) return h - 1;
    return 0;
  }

  // --- Arrow button double-click protection (300ms debounce) ---
  var lastClickTime = 0;
  var leftArrow = document.getElementById('arrow-prev');
  var rightArrow = document.getElementById('arrow-next');
  if (leftArrow) {
    leftArrow.addEventListener('click', function(e) {
      e.preventDefault();
      var now = Date.now();
      if (now - lastClickTime < 300) return;
      lastClickTime = now;
      prev();
    });
  }
  if (rightArrow) {
    rightArrow.addEventListener('click', function(e) {
      e.preventDefault();
      var now = Date.now();
      if (now - lastClickTime < 300) return;
      lastClickTime = now;
      next();
    });
  }

  // --- Overview click-to-jump ---
  slides.forEach(function(slide, i) {
    slide.addEventListener('click', function(e) {
      if (!overviewMode) return;
      e.stopPropagation();
      goTo(i, true);
      toggleOverview();
    });
  });

  // --- Expose on window ---
  window.goTo = goTo;
  window.next = next;
  window.prev = prev;
  window.toggleOverview = toggleOverview;
  window.deckEngine = {
    goTo: goTo,
    next: next,
    prev: prev,
    currentSlide: function() { return current; },
    totalSlides: function() { return total; }
  };

  // --- Init ---
  var startSlide = readHash();
  goTo(startSlide, true);

  window.addEventListener('hashchange', function() { goTo(readHash()); });
})();
