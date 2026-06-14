(function() {
  'use strict';

  var slideStepMaps = {};

  function initStepCarousels() {
    // Define explicit step-to-image mappings for slides with step-triggered carousels
    // Step numbers are 1-indexed; carousel images are 0-indexed
    slideStepMaps = {
      'signin-create-model': {
        steps: [
          0,  // Step 1: Go to website & sign in → Workspace image (intro context)
          0,  // Step 2: Open Workspace → Workspace image
          0,  // Step 3: Click Create Model → Workspace image
          1,  // Step 4: Name model → Model basics image
          1,  // Step 5: Select base model → Model basics image
          2,  // Step 6: Add system prompt → System prompt image
          2   // Step 7: Save → System prompt image
        ],
        slides: []  // Will store slide indices
      }
    };

    // Map data-slide attributes to slide indices
    var slides = document.querySelectorAll('.slide');
    var slideArray = Array.from(slides);

    slideArray.forEach(function(slide, idx) {
      var dataSlide = slide.getAttribute('data-slide');
      Object.keys(slideStepMaps).forEach(function(key) {
        if (key === dataSlide) {
          slideStepMaps[key].slides.push(idx);
        }
      });
    });

    // Listen for step reveals from deck-engine
    // This will be triggered when slides advance or step-hidden elements appear
    document.addEventListener('slidechange', function(e) {
      updateCarousels(e.detail.slideIndex, e.detail.step);
    });
  }

  function updateCarousels(slideIndex, stepNum) {
    // Find if this slide has a step-carousel mapping
    var slideCarousels = document.querySelectorAll('.slide[data-slide]');

    slideCarousels.forEach(function(slide, idx) {
      var dataSlide = slide.getAttribute('data-slide');
      var config = slideStepMaps[dataSlide];

      if (!config || !config.steps) return;

      var carousel = slide.querySelector('.carousel');
      if (!carousel) return;

      // Map step number to carousel item
      var stepIndex = (stepNum || 0) - 1; // Convert to 0-indexed
      if (stepIndex >= 0 && stepIndex < config.steps.length) {
        var carouselIndex = config.steps[stepIndex];
        if (window.setCarouselIndex && carouselIndex >= 0) {
          var currentSlideIndex = Array.from(document.querySelectorAll('.slide')).indexOf(slide);
          window.setCarouselIndex(currentSlideIndex, carouselIndex);
        }
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStepCarousels);
  } else {
    initStepCarousels();
  }

  // Expose function for external triggering (fallback)
  window.updateCarousels = updateCarousels;
})();
