(function() {
  'use strict';

  var carousels = new Map();

  function initCarousels() {
    var slides = Array.from(document.querySelectorAll('.slide'));
    slides.forEach(function(slide, slideIndex) {
      var carousel = slide.querySelector('.carousel');
      if (!carousel) return;
      var items = Array.from(carousel.querySelectorAll('.carousel-item'));
      if (items.length <= 1) return;

      var dotsContainer = carousel.querySelector('.carousel-dots');
      var interval = parseInt(carousel.dataset.interval) || 5000;

      items.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Show image ' + (i + 1) + ' of ' + items.length);
        dot.addEventListener('click', function() { setCarouselIndex(slideIndex, i); });
        dotsContainer.appendChild(dot);
      });

      var syncSteps = carousel.hasAttribute('data-sync-steps');
      carousels.set(slideIndex, { items: items, dots: Array.from(dotsContainer.children), current: 0, interval: interval, timer: null, syncSteps: syncSteps });

      var prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-arrow carousel-arrow-prev';
      prevBtn.setAttribute('aria-label', 'Previous image');
      prevBtn.textContent = '\u2039';
      prevBtn.addEventListener('click', function(e) { e.stopPropagation(); var c = carousels.get(slideIndex); setCarouselIndex(slideIndex, (c.current - 1 + c.items.length) % c.items.length); });
      carousel.appendChild(prevBtn);

      var nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-arrow carousel-arrow-next';
      nextBtn.setAttribute('aria-label', 'Next image');
      nextBtn.textContent = '\u203A';
      nextBtn.addEventListener('click', function(e) { e.stopPropagation(); var c = carousels.get(slideIndex); setCarouselIndex(slideIndex, (c.current + 1) % c.items.length); });
      carousel.appendChild(nextBtn);

      carousel.addEventListener('click', function(e) {
        if (e.target.closest('.carousel-dots') || e.target.closest('.carousel-arrow')) return;
        var c = carousels.get(slideIndex);
        setCarouselIndex(slideIndex, (c.current + 1) % c.items.length);
      });

      // Touch/swipe support for mobile
      var touchStartX = 0;
      var touchEndX = 0;

      carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, false);

      carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(slideIndex);
      }, false);

      function handleSwipe(idx) {
        var swipeThreshold = 50; // Minimum pixels to register as swipe
        var diff = touchStartX - touchEndX;

        if (Math.abs(diff) < swipeThreshold) return;

        var c = carousels.get(idx);
        if (!c) return;

        if (diff > 0) {
          // Swiped left - next image
          setCarouselIndex(idx, (c.current + 1) % c.items.length);
        } else {
          // Swiped right - previous image
          setCarouselIndex(idx, (c.current - 1 + c.items.length) % c.items.length);
        }
      }
    });
  }

  function setCarouselIndex(slideIndex, imgIndex) {
    var c = carousels.get(slideIndex);
    if (!c) return;
    c.current = imgIndex;
    c.items.forEach(function(item, i) { item.classList.toggle('active', i === imgIndex); });
    c.dots.forEach(function(dot, i) { dot.classList.toggle('active', i === imgIndex); });
  }

  function startCarousel(slideIndex) {
    var c = carousels.get(slideIndex);
    if (!c || c.items.length <= 1) return;
    // Don't auto-advance synced carousels — they advance with step reveals
    if (c.syncSteps) return;
    clearInterval(c.timer);
    c.timer = setInterval(function() { setCarouselIndex(slideIndex, (c.current + 1) % c.items.length); }, c.interval);
  }

  function pauseCarousel(slideIndex) {
    var c = carousels.get(slideIndex);
    if (!c) return;
    clearInterval(c.timer);
    c.timer = null;
  }

  // Called by deck-engine on step reveals for synced carousels
  function updateCarousels(slideIndex, stepNumber) {
    var c = carousels.get(slideIndex);
    if (!c || !c.syncSteps) return;
    var imgIndex = Math.min(stepNumber - 1, c.items.length - 1);
    if (imgIndex >= 0) setCarouselIndex(slideIndex, imgIndex);
  }

  window.initCarousels = initCarousels;
  window.setCarouselIndex = setCarouselIndex;
  window.startCarousel = startCarousel;
  window.pauseCarousel = pauseCarousel;
  window.updateCarousels = updateCarousels;

  document.addEventListener('DOMContentLoaded', initCarousels);
})();
