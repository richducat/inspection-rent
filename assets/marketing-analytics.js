/* Marketing intent only. Account creation and payments are measured in the app.
   Uses the existing GTM dataLayer; does not configure tags, consent, or cookies. */
(function () {
  "use strict";
  if (window.__igMarketingAnalyticsBound) return;
  window.__igMarketingAnalyticsBound = true;

  document.addEventListener("click", function (event) {
    try {
      var anchor = event.target && event.target.closest ? event.target.closest("a") : null;
      if (!anchor || anchor.hasAttribute("download")) return;
      var href = anchor.getAttribute("href");
      if (!href) return;
      var destination = new URL(href, document.baseURI || window.location.href);
      if (destination.origin !== window.location.origin || !/^\/app\/?$/.test(destination.pathname)) return;

      var section = anchor.closest("section, header, footer");
      var location = anchor.getAttribute("data-cta-location");
      if (!location && window.location.pathname === "/check.html") {
        location = anchor.id === "rAppCta" ? "check_results" : "check_page";
      }
      if (!location) location = section && (section.id || section.tagName.toLowerCase()) || "page";
      // Only static location labels/pathnames: never send a property's address,
      // a user's email, the clicked URL/query string, or dynamic link text.
      location = /^[a-z0-9_-]{1,64}$/i.test(location) ? location : "page";
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "app_open_click",
        cta_location: location,
        source_page: window.location.pathname
      });
    } catch (_) {
      // Analytics failure must never prevent navigation into the workstation.
    }
  }, true);
})();
