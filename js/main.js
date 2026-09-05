/* ==========================================================================
   Jonas Fernandez — Portfolio
   Vanilla JS only. No dependencies, no build step. Runs as a static file.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu after a nav link is chosen
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Highlight the current page / section in nav ---------- */
  var navLinks = document.querySelectorAll(".nav-links a");
  var currentPath = window.location.pathname.replace(/\/index\.html$/, "/");

  navLinks.forEach(function (link) {
    var linkPath = link.getAttribute("href");
    if (!linkPath) return;

    // Match project-detail pages back to the "Projects" nav item
    if (
      linkPath.indexOf("#") === -1 &&
      currentPath.indexOf("/projects/") !== -1 &&
      linkPath.indexOf("projects") !== -1
    ) {
      link.classList.add("active");
    }
  });

  /* ---------- Scroll-linked active state for in-page sections (home page) ---------- */
  var sections = document.querySelectorAll("main [id]");
  var sectionLinks = {};

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      var id = href.slice(hashIndex + 1);
      sectionLinks[id] = link;
    }
  });

  if (sections.length && Object.keys(sectionLinks).length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = sectionLinks[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) {
              l.classList.remove("active");
            });
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---------- Gentle reveal-on-scroll for project cards ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (revealItems.length && "IntersectionObserver" in window && !prefersReducedMotion) {
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
      item.style.transitionDelay = Math.min(i * 60, 240) + "ms";
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ---------- Footer year ---------- */
  var yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
