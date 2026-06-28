(function () {
  "use strict";

  var showcase = document.getElementById("mkShowcase");
  if (showcase) {
    var showcaseSlides = showcase.querySelectorAll(".mk-showcase__slide");
    var showcaseIndex = 0;
    if (showcaseSlides.length > 1) {
      setInterval(function () {
        showcaseSlides[showcaseIndex].classList.remove("is-active");
        showcaseIndex = (showcaseIndex + 1) % showcaseSlides.length;
        showcaseSlides[showcaseIndex].classList.add("is-active");
      }, 3500);
    }
  }

  var els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  if (!("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(function (el) { observer.observe(el); });
})();
