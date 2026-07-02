/* =========================================================================
   YoApinan.com — Shared site script
   Renders the header & footer, wires nav behaviour, exposes helpers.
   Depends on: content.js  (window.SITE_CONTENT)
   ========================================================================= */
(function () {
  "use strict";

  // Draft preview: when opened from Admin as ?preview=1, render the unsaved draft.
  var C = window.SITE_CONTENT || {};
  try {
    if (location.search.indexOf("preview=1") > -1) {
      var draft = localStorage.getItem("ya_preview_content");
      if (draft) { C = JSON.parse(draft); }
    }
  } catch (e) { /* ignore */ }
  var S = C.settings || {};

  /* ---- Icons (inline SVG) --------------------------------------------- */
  var ICON = {
    line:
      '<svg class="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.7 3 2.4 6.5 2.4 10.8c0 3.9 3.4 7.1 8 7.7.3.07.7.22.8.5.07.25.05.64.02.9l-.13.8c-.04.24-.2.94.82.51 1.02-.43 5.5-3.24 7.5-5.55 1.38-1.5 2.04-3.05 2.04-4.86C21.6 6.5 17.3 3 12 3Z"/></svg>',
    arrow:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#ECEFF3"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#1C3A5E" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#F1E7E4"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#9E3328" stroke-width="2.1" stroke-linecap="round"/></svg>',
    chev:
      '<svg class="chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    mark:
      '<svg class="ph-mark" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" opacity="0.9"><path d="M3 17l5-5 3 3 4-6 6 8"/><path d="M3 21h18"/></svg>'
  };

  /* ---- Helpers -------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }

  var TH_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.getDate() + " " + TH_MONTHS[d.getMonth()] + " " + (d.getFullYear() + 543);
  }

  function articles() { return (C.articles || []).filter(function (a) { return a && a.published !== false; }); }
  function byCategory(cat) {
    return articles().filter(function (a) { return a.category === cat; })
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
  }
  function findArticle(slug) {
    return (C.articles || []).filter(function (a) { return a.slug === slug; })[0];
  }

  /* Placeholder thumbnail (used when no cover image set) */
  function thumb(a, className) {
    className = className || "card-thumb";
    if (a && a.cover) {
      return '<div class="' + className + '"><img src="' + attr(a.cover) + '" alt="' + attr(a.title) + '" loading="lazy"></div>';
    }
    var ph = (a && a.ph) || "ph-1";
    return '<div class="' + className + ' placeholder ph ' + ph + '">' +
      '<div>' + ICON.mark +
      '<div class="ph-title">' + esc(a ? a.title : "") + "</div></div></div>";
  }

  /* Tiny Markdown -> HTML (headings, bold, italic, links, lists, quote, hr) */
  function md(src) {
    if (!src) return "";
    var lines = String(src).replace(/\r\n/g, "\n").split("\n");
    var out = [], i = 0;
    function inline(t) {
      t = esc(t);
      t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
      t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, x, u) {
        return '<a href="' + attr(u) + '" target="_blank" rel="noopener">' + x + "</a>";
      });
      return t;
    }
    while (i < lines.length) {
      var ln = lines[i];
      if (/^\s*$/.test(ln)) { i++; continue; }
      if (/^###\s+/.test(ln)) { out.push("<h3>" + inline(ln.replace(/^###\s+/, "")) + "</h3>"); i++; continue; }
      if (/^##\s+/.test(ln)) { out.push("<h2>" + inline(ln.replace(/^##\s+/, "")) + "</h2>"); i++; continue; }
      if (/^#\s+/.test(ln)) { out.push("<h2>" + inline(ln.replace(/^#\s+/, "")) + "</h2>"); i++; continue; }
      if (/^\s*([-*])\s+/.test(ln)) {
        var items = [];
        while (i < lines.length && /^\s*([-*])\s+/.test(lines[i])) {
          items.push("<li>" + inline(lines[i].replace(/^\s*([-*])\s+/, "")) + "</li>"); i++;
        }
        out.push('<ul class="bullets">' + items.join("") + "</ul>"); continue;
      }
      if (/^>\s?/.test(ln)) {
        var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push('<p class="pullquote">' + inline(q.join(" ")) + "</p>"); continue;
      }
      if (/^---+\s*$/.test(ln)) { out.push("<hr class='divider' style='margin:1.5em 0'>"); i++; continue; }
      var para = [ln]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3}\s|>\s?|\s*[-*]\s|---+\s*$)/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      out.push("<p>" + inline(para.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  /* ---- Header / Footer markup ---------------------------------------- */
  var NAV = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "market-ideas", label: "Market Ideas", href: "market-ideas.html" },
    { key: "field-notes", label: "Field Notes", href: "field-notes.html" },
    { key: "track-record", label: "Track Record", href: "maverickmanagement.html" },
    { key: "about", label: "เกี่ยวกับผม", href: "about.html" },
    { key: "course", label: "คอร์สเรียน", href: "course.html" }
  ];

  function brandHtml() {
    var b = S.brand || "YoApinan.com";
    var acc = S.brandAccent || "";
    var html = esc(b);
    if (acc && b.indexOf(acc) > -1) {
      html = esc(b).replace(esc(acc), "<b>" + esc(acc) + "</b>");
    }
    return '<a class="brand" href="index.html"><img class="logo" src="logo.svg" alt=""><span>' + html + "</span></a>";
  }

  function renderHeader() {
    var page = document.body.dataset.page || "";
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (n.key === page ? ' class="active"' : "") + ">" + esc(n.label) + "</a>";
    }).join("");
    var line = S.lineUrl || "#";
    var html =
      '<div class="container nav">' +
        brandHtml() +
        '<nav class="nav-links" id="navLinks">' + links + "</nav>" +
        '<div class="nav-cta">' +
          '<a class="btn btn--ghost" href="course.html">คอร์สเรียน</a>' +
          '<a class="btn btn--line" href="' + attr(line) + '" target="_blank" rel="noopener">' + ICON.line + (S.lineLabel || "เพิ่มเพื่อนใน LINE") + "</a>" +
          '<button class="nav-toggle" id="navToggle" aria-label="เมนู" aria-expanded="false"><span></span></button>' +
        "</div>" +
      "</div>";
    var host = document.querySelector("[data-site-header]");
    if (host) { host.className = "site-header"; host.innerHTML = html; }
  }

  function renderFooter() {
    var line = S.lineUrl || "#";
    var col1 =
      '<div class="footer-brand">' + brandHtml() +
      '<p class="footer-disc" style="margin-top:6px">' + esc(S.footerTagline || "") + "</p></div>";
    var col2 =
      "<div><h4>เนื้อหา</h4><div class='footer-links'>" +
      '<a href="market-ideas.html">Market Ideas</a>' +
      '<a href="field-notes.html">Field Notes</a>' +
      '<a href="about.html">เกี่ยวกับผม</a>' +
      '<a href="course.html">โปรแกรมสอนสด 1:1 Snowball Profit System</a>' +
      "</div></div>";
    var col2b =
      "<div><h4>ติดตามเราได้ที่</h4><div class='footer-links'>" +
      '<a href="' + attr(S.facebookUrl || "#") + '" target="_blank" rel="noopener">Facebook</a>' +
      '<a href="' + attr(S.twitterUrl || "#") + '" target="_blank" rel="noopener">Twitter</a>' +
      '<a href="' + attr(line) + '" target="_blank" rel="noopener">LINE</a>' +
      "</div></div>";
    var col3 =
      "<div><h4>Disclaimer (ข้อจำกัดความรับผิดชอบ)</h4>" +
      '<p class="footer-disc">' + esc(S.footerDisclaimer || "") + "</p></div>";
    var html =
      '<div class="container">' +
        '<div class="footer-grid">' + col1 + col2 + col2b + col3 + "</div>" +
        '<div class="footer-bottom">' + esc(S.copyright || "") + "</div>" +
      "</div>";
    var host = document.querySelector("[data-site-footer]");
    if (host) { host.className = "site-footer"; host.innerHTML = html; }
  }

  /* ---- Behaviours ----------------------------------------------------- */
  function wireBehaviours() {
    var header = document.querySelector("[data-site-header]");
    function onScroll() {
      if (!header) return;
      header.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = document.getElementById("navToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.querySelectorAll("#navLinks a").forEach(function (a) {
        a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
      });
    }

    // apply LINE / register links anywhere on the page
    document.querySelectorAll("[data-line]").forEach(function (el) {
      el.setAttribute("href", S.lineUrl || "#"); el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener");
    });
    document.querySelectorAll("[data-register]").forEach(function (el) {
      el.setAttribute("href", S.registerUrl || "#");
    });

    // reveal on scroll
    var io;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
    }

    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---- expose + init -------------------------------------------------- */
  window.YA = {
    C: C, S: S, ICON: ICON,
    esc: esc, attr: attr, md: md, thumb: thumb,
    formatDate: formatDate, articles: articles, byCategory: byCategory, findArticle: findArticle
  };

  function init() {
    if (!window.SITE_CONTENT) {
      console.error("content.js ไม่ถูกโหลด");
    }
    renderHeader();
    renderFooter();
    wireBehaviours();
    if (typeof window.PAGE_INIT === "function") {
      try { window.PAGE_INIT(window.YA); } catch (e) { console.error(e); }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
