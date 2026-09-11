/* Marketing intent only. Account creation and payments are measured in the app.
   Uses the existing GTM dataLayer; does not configure tags, consent, or cookies. */
(function () {
  "use strict";
  if (window.__igMarketingAnalyticsBound) return;
  window.__igMarketingAnalyticsBound = true;
  var navigationPending = false;

  document.addEventListener("click", function (event) {
    var finishNavigation = null;
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
      var payload = {
        event: "app_open_click",
        cta_location: location,
        source_page: window.location.pathname
      };

      var base = document.querySelector ? document.querySelector("base[target]") : null;
      var target = anchor.getAttribute("target") || base && base.getAttribute("target") || "_self";
      var sameTab = target.toLowerCase() === "_self" && event.button === 0 && event.cancelable &&
        !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      if (sameTab) {
        event.preventDefault();
        // A rapid repeat click should not create another pending navigation.
        if (navigationPending) return;
        navigationPending = true;
        var finished = false;
        var timer = null;
        finishNavigation = function () {
          if (finished) return;
          finished = true;
          navigationPending = false;
          if (timer !== null) {
            try { window.clearTimeout(timer); } catch (_) { /* Navigation still wins. */ }
          }
          try { window.location.assign(destination.href); }
          catch (_) { window.location.href = destination.href; }
        };
        // GTM can finish early. The independent timer also works when GTM is
        // blocked, never loads, or never calls back. Query/hash stay intact.
        timer = window.setTimeout(finishNavigation, 300);
        payload.eventCallback = finishNavigation;
        payload.eventTimeout = 250;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
    } catch (_) {
      // Even a broken queue or timer must not strand a canceled native click.
      if (finishNavigation) finishNavigation();
    }
  }, true);
})();
