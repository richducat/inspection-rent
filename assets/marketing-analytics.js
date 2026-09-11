/* Marketing intent only. Account creation and payments are measured in the app.
   Uses existing Google tags; does not configure tags, consent, or cookies. */
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
        // Wait for the Google event command, not GTM's tag-completion callback.
        // The independent timer still navigates if tags are blocked or silent.
        timer = window.setTimeout(finishNavigation, 300);
      }
      window.dataLayer = window.dataLayer || [];
      if (sameTab) {
        // One event path per click. The standard queue wrapper works when GTM
        // loaded the Google tag without defining a global gtag function.
        var send = typeof window.gtag === "function" ? window.gtag : function () {
          window.dataLayer.push(arguments);
        };
        send.call(window, "event", "app_open_click", {
          send_to: "G-36J97SMTD7",
          cta_location: location,
          event_callback: finishNavigation,
          event_timeout: 250
        });
      } else {
        // Existing GTM event route remains appropriate when this page stays open.
        window.dataLayer.push(payload);
      }
    } catch (_) {
      // Even a broken queue or timer must not strand a canceled native click.
      if (finishNavigation) finishNavigation();
    }
  }, true);
})();
