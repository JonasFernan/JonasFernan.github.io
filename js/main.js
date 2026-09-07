/* ==========================================================================
   Jonas Fernandez — Portfolio
   Vanilla JS only. No dependencies, no build step. Runs as a static file.

   Each feature below is wrapped in its own try/catch and reads only the
   elements it needs. If one feature errors out, the others still run —
   nothing on the page depends on all of this script executing successfully,
   and nothing is hidden by default in CSS unless a script has already
   confirmed it can reveal it again (see the reveal-on-scroll section).
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav toggle ---------- */
  (function initMobileNav() {
    try {
      var toggle = document.querySelector(".nav-toggle");
      var links = document.querySelector(".nav-links");
      if (!toggle || !links) return;

      function closeMenu() {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }

      toggle.addEventListener("click", function () {
        var isOpen = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      // Close the mobile menu after a nav link is chosen
      links.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });

      // Close on Escape for keyboard users
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" || e.key === "Esc") closeMenu();
      });

      // If the viewport is resized past the mobile breakpoint while the
      // menu is open, reset it — otherwise it can be left visibly "open"
      // but positioned incorrectly once the mobile layout no longer applies.
      var mobileQuery = window.matchMedia("(min-width: 721px)");
      var handleBreakpointChange = function (e) {
        if (e.matches) closeMenu();
      };
      if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener("change", handleBreakpointChange);
      } else if (mobileQuery.addListener) {
        // Safari < 14 fallback
        mobileQuery.addListener(handleBreakpointChange);
      }
    } catch (err) {
      // Fails safe: nav links are always present and clickable without JS,
      // this only loses the collapsible mobile menu behavior.
    }
  })();

  /* ---------- Nav active-state ---------- */
  (function initActiveNav() {
    try {
      var navLinks = document.querySelectorAll(".nav-links a");
      if (!navLinks.length) return;

      var page = document.body.getAttribute("data-page");

      function clearActive() {
        navLinks.forEach(function (l) {
          l.classList.remove("active");
        });
      }

      // On a project detail page, simply highlight "Projects" — there is no
      // scroll-spy target set on these pages.
      if (page === "project") {
        navLinks.forEach(function (link) {
          var href = link.getAttribute("href") || "";
          if (href.indexOf("#projects") !== -1) {
            link.classList.add("active");
          }
        });
        return;
      }

      // On the home page, highlight whichever section is currently in view.
      if (page !== "home" || !("IntersectionObserver" in window)) return;

      var sectionLinks = {};
      navLinks.forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var hashIndex = href.indexOf("#");
        if (hashIndex !== -1) {
          sectionLinks[href.slice(hashIndex + 1)] = link;
        }
      });

      var ids = Object.keys(sectionLinks);
      if (!ids.length) return;

      var sections = ids
        .map(function (id) {
          return document.getElementById(id);
        })
        .filter(Boolean);

      if (!sections.length) return;

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var link = sectionLinks[entry.target.id];
            if (!link) return;
            clearActive();
            link.classList.add("active");
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
    } catch (err) {
      // Fails safe: nav links remain fully usable without an active-state indicator.
    }
  })();

  /* ---------- Gentle reveal-on-scroll for project cards ----------
     Elements start fully visible (see CSS). Only once we've confirmed
     IntersectionObserver support and that the person isn't asking for
     reduced motion do we add "reveal-pending" (which CSS hides) right
     before observing it — so nothing can get stuck invisible. */
  (function initReveal() {
    try {
      var revealItems = document.querySelectorAll(".reveal");
      if (!revealItems.length) return;
      if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      revealItems.forEach(function (item, i) {
        item.classList.add("reveal-pending");
        item.style.transitionDelay = Math.min(i * 60, 240) + "ms";
        revealObserver.observe(item);
      });
    } catch (err) {
      // Fails safe: without "reveal-pending" ever being added, elements
      // simply remain at their default, fully visible state.
    }
  })();

  /* ---------- Hero rocket animation: respect reduced motion + save
     battery when the tab isn't visible ---------- */
  (function initRocketAnimation() {
    try {
      var svg = document.querySelector(".hero-graphic svg");
      if (!svg || typeof svg.pauseAnimations !== "function") return;

      if (prefersReducedMotion) {
        svg.pauseAnimations();
        return;
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          svg.pauseAnimations();
        } else {
          svg.unpauseAnimations();
        }
      });
    } catch (err) {
      // Fails safe: the rocket keeps animating (or sits at its start frame),
      // which is still a complete, legible graphic either way.
    }
  })();

  /* ---------- Footer year ---------- */
  (function initFooterYear() {
    try {
      var yearEls = document.querySelectorAll("[data-year]");
      yearEls.forEach(function (el) {
        el.textContent = new Date().getFullYear();
      });
    } catch (err) {
      // Fails safe: the year in the markup's fallback text is still shown.
    }
  })();
})();
