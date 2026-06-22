/* =========================================================================
   YoApinan.com — View renderer
   Builds page bodies from window.SITE_CONTENT, based on <main data-view="...">
   ========================================================================= */
(function () {
  "use strict";

  function R() { return window.YA; }
  function el() { return document.getElementById("app"); }

  /* ---- small builders ------------------------------------------------- */
  function phBox(extraClass, label, mark) {
    var YA = R();
    return '<div class="ph ' + (extraClass || "ph-1") + '" style="border-radius:var(--r-lg);display:grid;place-items:center;text-align:center;padding:28px;min-height:220px">' +
      "<div>" + (mark !== false ? YA.ICON.mark : "") +
      (label ? '<div class="ph-title">' + YA.esc(label) + "</div>" : "") + "</div></div>";
  }
  function imgOrPh(src, alt, phClass, label) {
    var YA = R();
    if (src) return '<img src="' + YA.attr(src) + '" alt="' + YA.attr(alt || "") + '" loading="lazy">';
    return phBox(phClass, label);
  }

  function catLabel(cat) { return cat === "market-ideas" ? "Market Ideas" : "Field Notes"; }

  function card(a) {
    var YA = R();
    return '<article class="card reveal">' +
      YA.thumb(a) +
      '<span class="' + (a.category === "field-notes" ? "card-tag gold" : "card-tag") + '">' + catLabel(a.category) + "</span>" +
      '<div class="card-body">' +
        '<div class="meta">' + YA.formatDate(a.date) + (a.readMin ? " · อ่าน " + a.readMin + " นาที" : "") + "</div>" +
        "<h3>" + YA.esc(a.title) + "</h3>" +
        "<p>" + YA.esc(a.excerpt || "") + "</p>" +
        '<span class="card-more">อ่านต่อ ' + YA.ICON.arrow + "</span>" +
      "</div>" +
      '<a class="card-link" href="article.html?slug=' + encodeURIComponent(a.slug) + '" aria-label="' + YA.attr(a.title) + '"></a>' +
    "</article>";
  }

  function checkList(items, cls) {
    var YA = R();
    return '<ul class="' + (cls || "feature-list") + '">' + items.map(function (it) {
      var b = it.b ? "<b>" + YA.esc(it.b) + "</b> " : "";
      var t = it.t != null ? it.t : it;
      return "<li>" + YA.ICON.check + "<span>" + b + YA.esc(t) + "</span></li>";
    }).join("") + "</ul>";
  }

  function lineBtn(label, lg) {
    var YA = R();
    return '<a class="btn btn--line' + (lg ? " btn--lg" : "") + '" data-line href="#">' + YA.ICON.line + YA.esc(label || (YA.S.lineLabel || "เพิ่มเพื่อนใน LINE")) + "</a>";
  }

  var HERO_LINES =
    '<svg class="hero-grid-lines" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">' +
    '<g fill="none" stroke="#C9A86A" stroke-opacity="0.28" stroke-width="1.4">' +
    '<path d="M0 320 C 150 300, 250 260, 360 270 S 560 230, 680 180 S 900 120, 1040 90 1200 60"/>' +
    '</g>' +
    '<g fill="none" stroke="#9FB0C2" stroke-opacity="0.14" stroke-width="1.2">' +
    '<path d="M0 360 C 180 350, 300 330, 430 330 S 640 300, 760 270 S 980 220, 1120 200 1200 190"/>' +
    "</g>" +
    "</svg>";

  /* ---- HOME ----------------------------------------------------------- */
  function home() {
    var YA = R(), C = YA.C, h = C.home || {}, S = YA.S;
    var stats = (h.heroStats || []).map(function (s) {
      return '<div class="hero-stat"><div class="n">' + YA.esc(s.n) + '</div><div class="l">' + YA.esc(s.l) + "</div></div>";
    }).join("");

    var hero =
      '<section class="hero">' + HERO_LINES +
        '<div class="container hero-inner">' +
          '<span class="eyebrow">' + YA.esc(h.heroEyebrow || "") + "</span>" +
          "<h1>" + YA.esc(h.heroTitleLine1 || "") + ' <span class="hl">' + YA.esc(h.heroTitleLine2 || "") + "</span></h1>" +
          '<p class="hero-sub">' + YA.esc(h.heroSub || "") + "</p>" +
          '<div class="hero-cta">' +
            '<a class="btn btn--accent btn--lg" href="course.html">ดูโปรแกรมเรียน 1:1 ' + YA.ICON.arrow + "</a>" +
            lineBtn(null, true) +
          "</div>" +
          (stats ? '<div class="hero-stats">' + stats + "</div>" : "") +
        "</div>" +
      "</section>";

    var snow =
      '<section class="section"><div class="container">' +
        '<div class="feature">' +
          '<div class="reveal">' +
            '<span class="badge-pill">' + YA.esc(h.snowballBadge || "") + "</span>" +
            "<h2 style='margin-top:16px'>" + YA.esc(h.snowballTitle || "") + "</h2>" +
            '<p class="lead" style="margin-top:12px">' + YA.esc(h.snowballDesc || "") + "</p>" +
            checkList(h.snowballChecks || [], "checks") +
            '<a class="btn btn--primary" style="margin-top:26px" href="course.html">เริ่มเรียนระบบนี้ ' + YA.ICON.arrow + "</a>" +
          "</div>" +
          '<div class="media reveal">' + imgOrPh(h.snowballImage, "The Snowball Profit System", "ph-3", "The Snowball Profit System") + "</div>" +
        "</div>" +
      "</div></section>";

    var mi = YA.byCategory("market-ideas").slice(0, 3).map(card).join("");
    var fn = YA.byCategory("field-notes").slice(0, 3).map(card).join("");

    var miSec =
      '<section class="section bg-warm"><div class="container">' +
        '<div class="grid-head reveal"><div><span class="eyebrow">Market Ideas</span><h2 style="margin-top:10px">วิเคราะห์ตลาด ด้วยโครงสร้างราคา</h2></div>' +
        '<a class="btn btn--ghost" href="market-ideas.html">ดูทั้งหมด ' + YA.ICON.arrow + "</a></div>" +
        '<div class="card-grid">' + (mi || emptyNote()) + "</div>" +
      "</div></section>";

    var fnSec =
      '<section class="section"><div class="container">' +
        '<div class="grid-head reveal"><div><span class="eyebrow">Field Notes</span><h2 style="margin-top:10px">มุมมองธุรกิจจากสนามจริง</h2></div>' +
        '<a class="btn btn--ghost" href="field-notes.html">ดูทั้งหมด ' + YA.ICON.arrow + "</a></div>" +
        '<div class="card-grid">' + (fn || emptyNote()) + "</div>" +
      "</div></section>";

    var cta =
      '<section class="section"><div class="container">' +
        '<div class="cta-band reveal"><h2>' + YA.esc(h.ctaTitle || "") + "</h2>" +
        "<p>" + YA.esc(h.ctaText || "") + "</p>" + lineBtn(null, true) + "</div>" +
      "</div></section>";

    el().innerHTML = hero + snow + miSec + fnSec + cta;
    setMeta(S.brand || "YoApinan.com", h.heroSub);
  }

  function emptyNote() {
    return '<p class="text-muted">ยังไม่มีบทความ — เพิ่มได้ในหน้า Admin</p>';
  }

  /* ---- LIST (market-ideas / field-notes) ------------------------------ */
  function list(view) {
    var YA = R(), C = YA.C;
    var meta = view === "market-ideas" ? (C.marketIdeas || {}) : (C.fieldNotes || {});
    var items = YA.byCategory(view).map(card).join("");
    el().innerHTML =
      '<section class="page-hero"><div class="container">' +
        '<span class="eyebrow">' + (view === "market-ideas" ? "Market Ideas" : "Field Notes") + "</span>" +
        "<h1 style='margin-top:14px'>" + YA.esc(meta.title || "") + "</h1>" +
        "<p class='lead'>" + YA.esc(meta.intro || "") + "</p>" +
        '<hr class="divider">' +
      "</div></section>" +
      '<section class="section section--tight"><div class="container">' +
        '<div class="card-grid">' + (items || emptyNote()) + "</div>" +
      "</div></section>";
    setMeta((meta.title || "") + " — " + (YA.S.brand || ""), meta.intro);
  }

  /* ---- ABOUT ---------------------------------------------------------- */
  function aboutBlock(b) {
    var YA = R();
    switch (b.type) {
      case "h2": return "<h2>" + YA.esc(b.text) + "</h2>";
      case "h3": return "<h3>" + YA.esc(b.text) + "</h3>";
      case "p": return "<p>" + YA.esc(b.text) + "</p>";
      case "quote": return '<p class="pullquote">' + YA.esc(b.text) + "</p>";
      case "list": return '<ul class="bullets">' + (b.items || []).map(function (i) { return "<li>" + YA.esc(i) + "</li>"; }).join("") + "</ul>";
      case "image": return b.img ? '<img src="' + YA.attr(b.img) + '" alt="' + YA.attr(b.caption || "") + '">' : phBox("ph-6", "");
      case "figure2":
        return '<div class="figure-2">' + (b.items || []).map(function (it) {
          return "<figure>" + (it.img ? '<img src="' + YA.attr(it.img) + '" alt="' + YA.attr(it.caption || "") + '">' : phBox("ph-2", "")) +
            (it.caption ? '<figcaption>' + YA.esc(it.caption) + "</figcaption>" : "") + "</figure>";
        }).join("") + "</div>";
      default: return "";
    }
  }
  function about() {
    var YA = R(), a = YA.C.about || {};
    var blocks = (a.blocks || []).map(aboutBlock).join("");
    el().innerHTML =
      '<section class="page-hero"><div class="container">' +
        '<span class="eyebrow">เกี่ยวกับผม</span>' +
        "<h1 style='margin-top:14px'>" + YA.esc(a.title || "") + "</h1>" +
        "<p class='lead'>" + YA.esc(a.sub || "") + "</p>" +
      "</div></section>" +
      '<section class="section section--tight"><div class="container">' +
        '<div class="prose reveal">' + (a.portrait ? '<img class="lead-photo" src="' + YA.attr(a.portrait) + '" alt="">' : phBox("ph-1", "")) + "</div>" +
        '<div class="prose" style="margin-top:8px">' + blocks + "</div>" +
        '<div class="prose" style="margin-top:36px"><div class="cta-band">' +
          '<h2>มองหาระบบที่ใช้งานได้จริง ไม่ซับซ้อน และทำซ้ำได้?</h2>' +
          "<p>ผมรวบรวมทุกอย่างไว้ในโปรแกรมเรียนสด 1:1 แล้วครับ</p>" +
          '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
          '<a class="btn btn--accent btn--lg" href="course.html">ดูคอร์สเรียน ' + YA.ICON.arrow + "</a>" + lineBtn(null, true) + "</div>" +
        "</div></div>" +
      "</div></section>";
    setMeta((a.title || "") + " — " + (YA.S.brand || ""), a.sub);
  }

  /* ---- COURSE --------------------------------------------------------- */
  function course() {
    var YA = R(), c = YA.C.course || {}, S = YA.S;

    var cases = (c.cases || []).map(function (k) {
      return '<div class="case reveal"><div class="pct">' + YA.esc(k.pct) + '</div><div class="lbl">' + YA.esc(k.label) + '</div><div class="sym">' + YA.esc(k.sym) + "</div></div>";
    }).join("");

    var bio = (c.instructorBio || []).map(function (p) { return "<p>" + YA.esc(p) + "</p>"; }).join("");
    var pains = (c.painpoints || []).map(function (p) { return '<li><span class="x">' + YA.ICON.x + "</span><span>" + YA.esc(p) + "</span></li>"; }).join("");
    var weeks = (c.weeks || []).map(function (w) {
      return '<div class="week reveal"><div class="week-no">WEEK<b>' + w.n + '</b></div><div><h3>' + YA.esc(w.title) + "</h3><p>" + YA.esc(w.desc) + "</p></div></div>";
    }).join("");
    var includes = (c.includes || []).map(function (i) { return "<li>" + YA.ICON.check + "<span>" + YA.esc(i) + "</span></li>"; }).join("");
    var faqs = (c.faqs || []).map(function (f) {
      return "<details><summary>" + YA.esc(f.q) + YA.ICON.chev + '</summary><div class="faq-a">' + YA.esc(f.a) + "</div></details>";
    }).join("");

    var html =
      // hero
      '<section class="section"><div class="container course-hero">' +
        '<span class="eyebrow" style="justify-content:center">The Snowball Profit System</span>' +
        "<h1 style='margin-top:16px'>" + YA.esc(c.heroTitle || "") + "</h1>" +
        "<p class='lead'>" + YA.esc(c.heroSub || "") + "</p>" +
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:8px">' +
        '<a class="btn btn--accent btn--lg" href="#pricing">ดูรายละเอียดและราคา ' + YA.ICON.arrow + "</a>" + lineBtn("สอบถามทาง LINE", true) + "</div>" +
      "</div></section>" +

      // case study
      '<section class="section bg-dark"><div class="container">' +
        '<div class="section-head center" style="margin-inline:auto"><h2>กรณีศึกษา Trade Setup</h2><p>' + YA.esc(c.caseIntro || "") + "</p></div>" +
        '<div class="case-strip">' + cases + "</div>" +
        '<div class="disclaimer-box" style="margin-top:26px;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.12);color:#9CA9B4">' + YA.esc(c.caseDisclaimer || "") + "</div>" +
      "</div></section>" +

      // instructor
      '<section class="section"><div class="container"><div class="feature">' +
        '<div class="media reveal">' + imgOrPh(c.instructorPhoto, c.instructorName, "ph-4", "โย อภินันท์") + "</div>" +
        '<div class="reveal"><span class="eyebrow">ผู้สอน</span><h2 style="margin-top:12px">' + YA.esc(c.instructorName || "") + "</h2>" +
          '<p class="lead" style="color:var(--accent-2);font-weight:600;margin-top:6px">' + YA.esc(c.instructorTagline || "") + "</p>" +
          '<div style="margin-top:14px;display:grid;gap:12px">' + bio + "</div>" +
        "</div>" +
      "</div></div></section>" +

      // pain points
      '<section class="section bg-warm"><div class="container"><div class="painpoints">' +
        '<div class="reveal"><h2>' + YA.esc(c.painTitle || "") + '</h2><ul class="painlist" style="margin-top:22px">' + pains + "</ul></div>" +
        '<div class="reveal">' + phBox("ph-5", "เรียนมาหลายที่… แต่ยังวนลูป?") + "</div>" +
      "</div></div></section>" +

      // solution
      '<section class="section"><div class="container" style="max-width:840px">' +
        '<div class="reveal center section-head" style="margin-inline:auto"><h2>' + YA.esc(c.solutionTitle || "") + "</h2>" +
        '<p class="lead" style="font-weight:700;color:var(--ink);margin-top:10px">' + YA.esc(c.solutionSub || "") + "</p>" +
        "<p style='margin-top:8px'>" + YA.esc(c.solutionDesc || "") + "</p></div>" +
        '<div class="reveal" style="margin-top:8px">' + checkList(c.solutionPoints || []) + "</div>" +
      "</div></section>" +

      // system + value props
      '<section class="section bg-warm"><div class="container"><div class="feature">' +
        '<div class="reveal"><span class="badge-pill">The Snowball Profit System</span><h2 style="margin-top:14px">' + YA.esc(c.systemTitle || "") + "</h2>" +
        '<p class="lead" style="margin-top:12px">' + YA.esc(c.systemDesc || "") + "</p></div>" +
        '<div class="media reveal">' + imgOrPh(c.systemPhoto, "", "ph-3", "ระบบเดียวที่คุณต้องการ") + "</div>" +
      "</div>" +
        '<div class="reveal" style="margin-top:48px"><h3 class="center" style="max-width:760px;margin:0 auto 26px">' + YA.esc(c.valueTitle || "") + "</h3>" +
        checkList(c.valueProps || []) + "</div>" +
      "</div></section>" +

      // weeks
      '<section class="section"><div class="container">' +
        '<div class="section-head center" style="margin-inline:auto"><span class="eyebrow" style="justify-content:center">หลักสูตร 6 สัปดาห์</span><h2 style="margin-top:10px">' + YA.esc(c.weeksTitle || "") + "</h2></div>" +
        '<div class="weeks">' + weeks + "</div>" +
      "</div></section>" +

      // format
      '<section class="section bg-warm"><div class="container" style="max-width:840px">' +
        '<div class="section-head center" style="margin-inline:auto"><h2>' + YA.esc(c.formatTitle || "") + "</h2></div>" +
        '<div class="reveal">' + checkList(c.format || []) + "</div>" +
      "</div></section>" +

      // fit
      '<section class="section"><div class="container">' +
        '<div class="section-head center" style="margin-inline:auto"><h2>' + YA.esc(c.fitTitle || "") + "</h2></div>" +
        '<div class="fit-cols">' +
          '<div class="fit-card good reveal"><h3>' + YA.ICON.check + " เหมาะสำหรับ</h3><ul>" +
            (c.fitGood || []).map(function (i) { return "<li>" + YA.ICON.check + "<span>" + YA.esc(i) + "</span></li>"; }).join("") + "</ul></div>" +
          '<div class="fit-card bad reveal"><h3>' + YA.ICON.x + " ไม่เหมาะสำหรับ</h3><ul>" +
            (c.fitBad || []).map(function (i) { return "<li>" + YA.ICON.x + "<span>" + YA.esc(i) + "</span></li>"; }).join("") + "</ul></div>" +
        "</div>" +
      "</div></section>" +

      // pricing
      '<section class="section bg-dark" id="pricing"><div class="container">' +
        '<div class="section-head center" style="margin-inline:auto"><h2>' + YA.esc(c.pricingTitle || "") + "</h2><p>" + YA.esc(c.pricingSub || "") + "</p></div>" +
        '<div class="pricing reveal">' +
          '<div class="pricing-top"><div class="name">' + YA.esc(S.priceName || c.priceName || "") + '</div><div class="price">' + YA.esc(S.price || "") + "</div>" +
          '<div class="text-muted" style="font-size:.9rem">โปรแกรมเรียนสด 1:1 · 6 สัปดาห์</div></div>' +
          '<div class="pricing-list"><ul>' + includes + "</ul>" +
            '<a class="btn btn--accent btn--lg btn--block" data-register href="#">' + YA.esc(c.ctaButton || "ลงทะเบียนเรียนทันที") + "</a>" +
            '<div class="paylogos"><span>รองรับการชำระเงิน: บัตรเครดิต/เดบิต · พร้อมเพย์ · โอนผ่านธนาคาร</span></div>' +
            '<div class="pricing-note">' + YA.ICON.check + "<span>" + YA.esc(c.guarantee || "") + "</span></div>" +
            '<div class="scarcity">⚠️ ' + YA.esc(c.scarcity || "") + "</div>" +
          "</div>" +
        "</div>" +
        '<p class="center" style="color:#C6D1DA;margin-top:26px">' + YA.esc(c.priceQuote || "") + "</p>" +
        '<div class="center" style="margin-top:18px;color:#9CA9B4">' + YA.esc(c.contactNote || "") + '</div>' +
        '<div class="center" style="margin-top:14px">' + lineBtn("สอบถามทาง LINE", false) + "</div>" +
      "</div></section>" +

      // faq
      '<section class="section"><div class="container">' +
        '<div class="section-head center" style="margin-inline:auto"><h2>' + YA.esc(c.faqTitle || "คำถามที่พบบ่อย") + "</h2></div>" +
        '<div class="faq">' + faqs + "</div>" +
      "</div></section>";

    el().innerHTML = html;
    setMeta((S.priceName || "คอร์สเรียน") + " — " + (S.brand || ""), c.heroSub);
  }

  /* ---- ARTICLE -------------------------------------------------------- */
  function article() {
    var YA = R();
    var slug = new URLSearchParams(location.search).get("slug");
    var a = slug ? YA.findArticle(slug) : null;
    if (!a) {
      el().innerHTML =
        '<section class="section"><div class="container center" style="padding-block:80px">' +
        "<h1>ไม่พบบทความ</h1><p class='lead' style='margin:14px auto 24px'>บทความที่คุณค้นหาอาจถูกย้ายหรือลบไปแล้ว</p>" +
        '<a class="btn btn--primary" href="index.html">กลับหน้าแรก</a>' +
        "</div></section>";
      setMeta("ไม่พบบทความ — " + (YA.S.brand || ""), "");
      return;
    }
    var related = YA.byCategory(a.category).filter(function (x) { return x.slug !== a.slug; }).slice(0, 3).map(card).join("");
    var hero = a.cover
      ? '<img class="lead-photo" src="' + YA.attr(a.cover) + '" alt="' + YA.attr(a.title) + '">'
      : phBox(a.ph || "ph-1", "");

    el().innerHTML =
      '<article><section class="page-hero"><div class="container" style="max-width:820px">' +
        '<a class="card-more" href="' + (a.category === "market-ideas" ? "market-ideas.html" : "field-notes.html") + '" style="margin-bottom:18px">' +
          '<span style="transform:rotate(180deg);display:inline-flex">' + YA.ICON.arrow + "</span> " + catLabel(a.category) + "</a>" +
        "<h1 style='margin-top:6px'>" + YA.esc(a.title) + "</h1>" +
        '<div class="text-muted" style="margin-top:14px;font-family:var(--font-display);font-weight:600">' +
          YA.formatDate(a.date) + (a.readMin ? " · อ่าน " + a.readMin + " นาที" : "") + "</div>" +
      "</div></section>" +
      '<div class="container" style="max-width:820px"><div class="prose" style="margin-top:8px">' + hero + "</div>" +
      '<div class="prose" style="margin-top:28px">' + YA.md(a.body || "") + "</div>" +
      '<div class="prose" style="margin-top:40px"><div class="disclaimer-box">บทความนี้จัดทำเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน โปรดใช้วิจารณญาณและบริหารความเสี่ยงด้วยตนเอง</div></div>' +
      "</div>" +
      (related ?
        '<section class="section"><div class="container"><div class="grid-head"><h2>บทความที่เกี่ยวข้อง</h2></div><div class="card-grid">' + related + "</div></div></section>"
        : '<div style="height:64px"></div>') +
      "</article>";
    setMeta(a.title + " — " + (YA.S.brand || ""), a.excerpt);
  }

  /* ---- meta helper ---------------------------------------------------- */
  function setMeta(title, desc) {
    if (title) document.title = title;
    if (desc) {
      var m = document.querySelector('meta[name="description"]');
      if (!m) { m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); }
      m.setAttribute("content", String(desc).slice(0, 180));
    }
  }

  /* ---- dispatch ------------------------------------------------------- */
  window.PAGE_INIT = function () {
    var main = el();
    if (!main) return;
    var view = main.getAttribute("data-view");
    switch (view) {
      case "home": home(); break;
      case "market-ideas": list("market-ideas"); break;
      case "field-notes": list("field-notes"); break;
      case "about": about(); break;
      case "course": course(); break;
      case "article": article(); break;
    }
    // re-observe reveals created after header init
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.1 });
      document.querySelectorAll(".reveal:not(.in)").forEach(function (n) { io.observe(n); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });
    }
  };
})();
