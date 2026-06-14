/* embeds.js — lazily load live <iframe data-src> previews only when the
   slide they live on becomes active. Keeps 6+ live sites from all loading
   at once, and guarantees a fresh load right when the presenter shows it. */
(function () {
  'use strict';

  function loadEmbeds(slide) {
    var frames = slide.querySelectorAll('iframe[data-src]:not([data-loaded])');
    frames.forEach(function (f) {
      f.setAttribute('data-loaded', '1');
      // small delay lets the slide transition start before the network hit
      setTimeout(function () { f.src = f.getAttribute('data-src'); }, 120);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));

  // Load whichever slide is already active on init.
  slides.forEach(function (s) { if (s.classList.contains('active')) loadEmbeds(s); });

  // Observe class changes so we catch every activation (engine toggles .active).
  var obs = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      var el = m.target;
      if (el.classList && el.classList.contains('active')) loadEmbeds(el);
    });
  });
  slides.forEach(function (s) {
    obs.observe(s, { attributes: true, attributeFilter: ['class'] });
  });
})();
