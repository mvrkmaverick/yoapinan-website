/* =========================================================================
   YoApinan.com — CMS (admin.js)
   Self-service content manager. Edit -> Save draft / Preview / Publish(GitHub)
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- state ---------- */
  var SOURCE = window.SITE_CONTENT ? clone(window.SITE_CONTENT) : {};
  var work = clone(SOURCE);
  var current = "dashboard";
  var artFilter = "all";

  var LS_DRAFT = "ya_draft";
  var LS_GH = "ya_gh";
  var LS_TOKEN = "ya_gh_token";

  /* ---------- tiny helpers ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o == null ? {} : o)); }
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }

  function h(tag, attrs) {
    var e = document.createElement(tag), i, k, v;
    if (attrs) for (k in attrs) {
      v = attrs[k];
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "style") e.setAttribute("style", v);
      else if (k.slice(0, 2) === "on" && typeof v === "function") e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) e.setAttribute(k, "");
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(parent, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { add(parent, k); }); return; }
    parent.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }

  function getByPath(obj, path) { return path.reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function setByPath(obj, path, val) {
    var o = obj;
    for (var i = 0; i < path.length - 1; i++) o = o[path[i]];
    o[path[path.length - 1]] = val;
  }

  function toast(msg, type) {
    var t = $("#toast"); t.textContent = msg; t.className = "toast show " + (type || "");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.className = "toast"; }, 3200);
  }

  function slugify(s) {
    var out = String(s || "").toLowerCase().trim()
      .replace(/[^\w฀-๿\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    // strip thai for cleaner urls; if nothing left, timestamp
    var ascii = out.replace(/[฀-๿]/g, "");
    ascii = ascii.replace(/^-|-$/g, "");
    return ascii || ("post-" + Date.now());
  }

  function dirty() { return JSON.stringify(work) !== JSON.stringify(SOURCE); }
  function refreshStatus(extra) {
    var s = dirty() ? "● มีการแก้ไขที่ยังไม่ Publish" : "ตรงกับเว็บที่เผยแพร่";
    $("#status").innerHTML = (extra ? extra + " · " : "") + s;
  }

  /* tiny markdown for live preview */
  function md(src) {
    if (!src) return "";
    var lines = String(src).replace(/\r\n/g, "\n").split("\n"), out = [], i = 0;
    function inl(t) {
      t = esc(t).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      return t;
    }
    while (i < lines.length) {
      var ln = lines[i];
      if (/^\s*$/.test(ln)) { i++; continue; }
      if (/^###\s+/.test(ln)) { out.push("<h3>" + inl(ln.replace(/^###\s+/, "")) + "</h3>"); i++; continue; }
      if (/^##\s+/.test(ln)) { out.push("<h2>" + inl(ln.replace(/^##\s+/, "")) + "</h2>"); i++; continue; }
      if (/^#\s+/.test(ln)) { out.push("<h2>" + inl(ln.replace(/^#\s+/, "")) + "</h2>"); i++; continue; }
      if (/^\s*[-*]\s+/.test(ln)) { var it = []; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { it.push("<li>" + inl(lines[i].replace(/^\s*[-*]\s+/, "")) + "</li>"); i++; } out.push("<ul>" + it.join("") + "</ul>"); continue; }
      if (/^>\s?/.test(ln)) { var q = []; while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; } out.push('<blockquote>' + inl(q.join(" ")) + "</blockquote>"); continue; }
      var p = [ln]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3}\s|>\s?|\s*[-*]\s)/.test(lines[i])) { p.push(lines[i]); i++; }
      out.push("<p>" + inl(p.join(" ")) + "</p>");
    }
    return out.join("");
  }

  /* ---------- labels (Thai) ---------- */
  var LABELS = {
    settings: "ตั้งค่าทั่วไป", brand: "ชื่อแบรนด์", brandAccent: "คำที่เน้นสีในชื่อ",
    lineUrl: "ลิงก์ LINE (เพิ่มเพื่อน)", lineLabel: "ข้อความปุ่ม LINE", facebookUrl: "ลิงก์ Facebook",
    twitterUrl: "ลิงก์ Twitter/X", registerUrl: "ลิงก์ลงทะเบียน/ชำระเงิน", priceName: "ชื่อแพ็กเกจ", price: "ราคา",
    footerTagline: "คำโปรยท้ายเว็บ", footerDisclaimer: "ข้อความ Disclaimer", copyright: "ลิขสิทธิ์ (Copyright)",
    home: "หน้าแรก", heroEyebrow: "ป้ายเล็กเหนือหัวข้อ", heroTitleLine1: "หัวข้อใหญ่ บรรทัด 1", heroTitleLine2: "หัวข้อใหญ่ บรรทัด 2 (เน้นสี)",
    heroSub: "คำอธิบายใต้หัวข้อ", heroStats: "ตัวเลขสถิติ (Hero)", n: "ตัวเลข/ค่า", l: "คำอธิบาย",
    snowballBadge: "ป้ายระบบ", snowballTitle: "หัวข้อระบบ", snowballDesc: "อธิบายระบบ", snowballChecks: "จุดเด่น (ติ๊กถูก)", snowballImage: "รูประบบ",
    ctaTitle: "หัวข้อ CTA", ctaText: "ข้อความ CTA",
    marketIdeas: "Market Ideas (หัวเพจ)", fieldNotes: "Field Notes (หัวเพจ)", title: "หัวข้อ", intro: "คำอธิบาย",
    about: "หน้าเกี่ยวกับผม", sub: "คำโปรย", portrait: "รูปโปรไฟล์", blocks: "เนื้อหา (ทีละบล็อก)",
    type: "ชนิดบล็อก", text: "ข้อความ", items: "รายการ", img: "รูป", caption: "คำบรรยายรูป",
    course: "หน้าคอร์สเรียน", heroTitle: "หัวข้อใหญ่", caseIntro: "คำนำกรณีศึกษา", cases: "การ์ดกรณีศึกษา",
    pct: "ตัวเลข %", label: "คำอธิบาย", sym: "สัญลักษณ์/หมายเหตุ", caseDisclaimer: "Disclaimer กรณีศึกษา",
    instructorName: "ชื่อผู้สอน", instructorTagline: "คำโปรยผู้สอน", instructorPhoto: "รูปผู้สอน", instructorBio: "ประวัติผู้สอน (ย่อหน้า)",
    painTitle: "หัวข้อ Pain points", painpoints: "ปัญหาที่เจอ", solutionTitle: "หัวข้อทางออก", solutionSub: "คำโปรยทางออก", solutionDesc: "อธิบายทางออก",
    solutionPoints: "จุดเด่นทางออก", b: "ตัวหนา (นำหน้า)", t: "ข้อความ", systemTitle: "หัวข้อระบบ", systemDesc: "อธิบายระบบ", systemPhoto: "รูประบบ",
    valueTitle: "หัวข้อคุณค่า", valueProps: "คุณค่าที่ได้รับ", weeksTitle: "หัวข้อหลักสูตร", weeks: "เนื้อหารายสัปดาห์", desc: "รายละเอียด",
    formatTitle: "หัวข้อรูปแบบเรียน", format: "รูปแบบการเรียน", fitTitle: "หัวข้อเหมาะกับใคร", fitGood: "เหมาะสำหรับ", fitBad: "ไม่เหมาะสำหรับ",
    pricingTitle: "หัวข้อราคา", pricingSub: "คำโปรยราคา", includes: "สิ่งที่ได้รับ", priceQuote: "ประโยคปิดการขาย", ctaButton: "ข้อความปุ่มสั่งซื้อ",
    guarantee: "การรับประกัน", scarcity: "ข้อความจำกัดจำนวน", contactNote: "หมายเหตุติดต่อ", faqTitle: "หัวข้อ FAQ", faqs: "คำถามที่พบบ่อย", q: "คำถาม", a: "คำตอบ",
    excerpt: "คำโปรย/สรุป", cover: "รูปปก", category: "หมวดหมู่", date: "วันที่", readMin: "เวลาอ่าน (นาที)", featured: "บทความเด่น", published: "เผยแพร่", body: "เนื้อหา (Markdown)", slug: "Slug (URL)", ph: "สีพื้นหลัง (ตอนไม่มีรูป)"
  };
  function lab(k) { return LABELS[k] || k; }

  var IMG_RE = /(image|cover|photo|portrait|img|thumb|logo)$/i;
  var LONG_RE = /(desc|intro|sub|body|disclaimer|text|tagline|quote|note|bio|answer|^a$|^t$|excerpt|content)/i;

  /* ---------- generic form builder ---------- */
  function buildForm(obj, basePath) {
    var frag = document.createDocumentFragment();
    Object.keys(obj).forEach(function (key) {
      if (key === "id") return; // hidden internal
      frag.appendChild(buildField(key, obj[key], basePath.concat(key)));
    });
    return frag;
  }

  function buildField(key, value, path) {
    // image
    if (IMG_RE.test(key) && (typeof value === "string" || value == null)) {
      return wrapField(key, imageField(path));
    }
    // category / type / ph selects
    if (key === "category") return wrapField(key, selectField(path, [["market-ideas", "Market Ideas"], ["field-notes", "Field Notes"]]));
    if (key === "type") return wrapField(key, selectField(path, [["p", "ย่อหน้า"], ["h2", "หัวข้อใหญ่ (H2)"], ["h3", "หัวข้อรอง (H3)"], ["quote", "คำคม (Quote)"], ["list", "รายการ (List)"], ["image", "รูปเดี่ยว"], ["figure2", "รูปคู่"]], true));
    if (key === "ph") return wrapField(key, selectField(path, [["ph-1", "เขียวน้ำเงิน"], ["ph-2", "ทอง"], ["ph-3", "ฟ้าน้ำทะเล"], ["ph-4", "ม่วง"], ["ph-5", "แดงเลือดหมู"], ["ph-6", "เขียวมรกต"]]));

    if (typeof value === "boolean") return boolField(key, path);
    if (typeof value === "number") return wrapField(key, inputField(path, "number"));
    if (Array.isArray(value)) return arrayField(key, value, path);
    if (isObj(value)) {
      var g = h("details", { class: "group", open: true },
        h("summary", {}, h("span", {}, lab(key)), h("span", { class: "chev" }, "›")),
        h("div", { class: "group-body" }));
      g.lastChild.appendChild(buildForm(value, path));
      return g;
    }
    // string / null
    var long = LONG_RE.test(key) || (typeof value === "string" && (value.length > 70 || value.indexOf("\n") > -1));
    return wrapField(key, long ? textareaField(path) : inputField(path, "text"));
  }

  function wrapField(key, control) {
    return h("div", { class: "field" }, h("label", {}, lab(key)), control);
  }
  function inputField(path, type) {
    var v = getByPath(work, path);
    return h("input", {
      class: "input", type: type || "text", value: v == null ? "" : v,
      oninput: function (e) { setByPath(work, path, type === "number" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value); onEdit(); }
    });
  }
  function textareaField(path) {
    var v = getByPath(work, path);
    var ta = h("textarea", { class: "textarea", oninput: function (e) { setByPath(work, path, e.target.value); onEdit(); } });
    ta.value = v == null ? "" : v;
    return ta;
  }
  function selectField(path, opts, rerender) {
    var v = getByPath(work, path);
    var sel = h("select", { class: "select", onchange: function (e) { setByPath(work, path, e.target.value); onEdit(); if (rerender) renderView(current); } });
    opts.forEach(function (o) { var op = h("option", { value: o[0] }, o[1]); if (o[0] === v) op.selected = true; sel.appendChild(op); });
    return sel;
  }
  function boolField(key, path) {
    var v = !!getByPath(work, path);
    var inp = h("input", { class: "sw", type: "checkbox", onchange: function (e) { setByPath(work, path, e.target.checked); onEdit(); } });
    inp.checked = v;
    return h("label", { class: "check", style: "margin-bottom:16px" }, inp, h("span", { class: "switch" }), lab(key));
  }

  function imageField(path) {
    var v = getByPath(work, path);
    var prev = h("div", { class: "imgprev" });
    function paint() { var cur = getByPath(work, path); if (cur) { prev.style.backgroundImage = "url('" + cur + "')"; prev.textContent = ""; } else { prev.style.backgroundImage = ""; prev.textContent = "ไม่มีรูป"; } }
    var file = h("input", { type: "file", accept: "image/*", class: "input", onchange: function (e) {
      var f = e.target.files[0]; if (!f) return;
      if (f.size > 1500000) toast("รูปใหญ่กว่า 1.5MB — แนะนำย่อรูปก่อนเพื่อให้เว็บโหลดเร็ว", "err");
      var r = new FileReader(); r.onload = function () { setByPath(work, path, r.result); paint(); urlInp.value = ""; onEdit(); }; r.readAsDataURL(f);
    } });
    var urlInp = h("input", { class: "input", type: "text", placeholder: "หรือวาง URL รูป", value: (v && v.slice(0, 5) !== "data:") ? v : "", oninput: function (e) { setByPath(work, path, e.target.value || null); paint(); onEdit(); } });
    var clr = h("button", { class: "btn btn-ghost btn-sm", onclick: function () { setByPath(work, path, null); paint(); urlInp.value = ""; onEdit(); } }, "ลบรูป");
    paint();
    return h("div", { class: "imgfield" }, prev, h("div", { class: "col" }, file, urlInp, h("div", {}, clr)));
  }

  function arrayField(key, arr, path) {
    var allStr = arr.every(function (x) { return typeof x === "string" || x == null; });
    var body = h("div", { class: "group-body" });
    var wrap = h("details", { class: "group", open: true },
      h("summary", {}, h("span", {}, lab(key) + "  (" + arr.length + ")"), h("span", { class: "chev" }, "›")), body);

    if (allStr) {
      arr.forEach(function (item, idx) {
        var long = (item || "").length > 60;
        var ctrl = long ? h("textarea", { class: "textarea" }) : h("input", { class: "input", type: "text" });
        if (long) ctrl.value = item || ""; else ctrl.value = item || "";
        ctrl.addEventListener("input", function (e) { arr[idx] = e.target.value; onEdit(); });
        body.appendChild(h("div", { class: "list-row" }, ctrl, h("div", { class: "list-actions" },
          iconBtn("↑", function () { move(arr, idx, -1); renderView(current); }),
          iconBtn("↓", function () { move(arr, idx, 1); renderView(current); }),
          iconBtn("✕", function () { arr.splice(idx, 1); onEdit(); renderView(current); }))));
      });
      body.appendChild(h("button", { class: "btn btn-ghost btn-sm add-row", onclick: function () { arr.push(""); onEdit(); renderView(current); } }, "+ เพิ่มรายการ"));
    } else {
      arr.forEach(function (item, idx) {
        var head = h("div", { class: "item-head" },
          h("span", { class: "t" }, lab(key) + " #" + (idx + 1)),
          h("div", { class: "list-actions" },
            iconBtn("↑", function () { move(arr, idx, -1); renderView(current); }),
            iconBtn("↓", function () { move(arr, idx, 1); renderView(current); }),
            iconBtn("✕", function () { arr.splice(idx, 1); onEdit(); renderView(current); })));
        var cardEl = h("div", { class: "item-card" }, head);
        cardEl.appendChild(buildForm(item, path.concat(idx)));
        body.appendChild(cardEl);
      });
      body.appendChild(h("button", { class: "btn btn-ghost btn-sm add-row", onclick: function () { arr.push(blankLike(arr[arr.length - 1])); onEdit(); renderView(current); } }, "+ เพิ่มรายการ"));
    }
    return wrap;
  }

  function blankLike(sample) {
    if (sample == null) return "";
    if (Array.isArray(sample)) return [];
    if (isObj(sample)) { var o = {}; Object.keys(sample).forEach(function (k) { o[k] = blankLike(sample[k]); }); return o; }
    if (typeof sample === "number") return 0;
    if (typeof sample === "boolean") return false;
    return "";
  }
  function move(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; onEdit(); }
  function iconBtn(txt, fn) { return h("button", { class: "btn-icon", onclick: fn, type: "button" }, txt); }

  function onEdit() { refreshStatus(); }

  /* ---------- views ---------- */
  var NAV = [
    ["dashboard", "แดชบอร์ด", "▦"],
    ["articles", "บทความ", "✎"],
    ["home", "หน้าแรก", "⌂"],
    ["about", "เกี่ยวกับผม", "☺"],
    ["course", "คอร์สเรียน", "🎓"],
    ["settings", "ตั้งค่าทั่วไป", "⚙"],
    ["deploy", "Publish / Deploy", "🚀"]
  ];
  var TITLES = { dashboard: "แดชบอร์ด", articles: "จัดการบทความ", home: "แก้ไขหน้าแรก", about: "แก้ไขหน้าเกี่ยวกับผม", course: "แก้ไขหน้าคอร์สเรียน", settings: "ตั้งค่าทั่วไป", deploy: "เผยแพร่ขึ้นเว็บ (Publish)" };

  function renderNav() {
    var nav = $("#sideNav"); nav.innerHTML = "";
    NAV.forEach(function (n) {
      nav.appendChild(h("button", { class: n[0] === current ? "active" : "", onclick: function () { go(n[0]); } },
        h("span", { class: "ic" }, n[2]), n[1]));
    });
  }
  function go(view) { current = view; document.body.classList.remove("nav-open"); renderNav(); renderView(view); window.scrollTo(0, 0); }

  function renderView(view) {
    $("#viewTitle").textContent = TITLES[view] || "";
    var c = $("#view"); c.innerHTML = "";
    refreshStatus();
    if (view === "dashboard") return dashboard(c);
    if (view === "articles") return articlesView(c);
    if (view === "deploy") return deployView(c);
    // generic page editors
    var map = { home: "home", about: "about", course: "course", settings: "settings" };
    var sectionKey = map[view];
    if (sectionKey) {
      if (!work[sectionKey]) work[sectionKey] = {};
      c.appendChild(h("div", { class: "banner ok" }, h("span", { class: "grow" },
        "แก้ข้อความด้านล่างได้เลย — ระบบบันทึกการแก้ไขอัตโนมัติในร่าง กด " ),
        h("b", {}, "ดูตัวอย่าง"), h("span", {}, " หรือ "), h("b", {}, "Publish"), h("span", {}, " เมื่อพร้อม")));
      c.appendChild(buildForm(work[sectionKey], [sectionKey]));
    }
  }

  function dashboard(c) {
    var arts = work.articles || [];
    var mi = arts.filter(function (a) { return a.category === "market-ideas"; }).length;
    var fn = arts.filter(function (a) { return a.category === "field-notes"; }).length;
    var pub = arts.filter(function (a) { return a.published !== false; }).length;
    c.appendChild(h("div", { class: "grid-cards" },
      stat(arts.length, "บทความทั้งหมด"), stat(pub, "เผยแพร่อยู่"), stat(mi, "Market Ideas"), stat(fn, "Field Notes")));

    c.appendChild(h("div", { class: "card card-pad", style: "margin-top:20px" },
      h("div", { class: "section-title" }, h("h2", {}, "เริ่มใช้งานด่วน"), null),
      h("div", { class: "hint", style: "margin-bottom:14px" }, "ทำงานบ่อย ๆ ได้จากปุ่มเหล่านี้"),
      h("div", { style: "display:flex;gap:10px;flex-wrap:wrap" },
        h("button", { class: "btn btn-accent", onclick: function () { go("articles"); setTimeout(function () { editArticle(null); }, 50); } }, "✎ เขียนบทความใหม่"),
        h("button", { class: "btn btn-ghost", onclick: function () { go("settings"); } }, "⚙ แก้ลิงก์ LINE / ราคา"),
        h("button", { class: "btn btn-ghost", onclick: doPreview }, "👁 ดูตัวอย่างเว็บ"),
        h("button", { class: "btn btn-blue", onclick: function () { go("deploy"); } }, "🚀 ตั้งค่า Publish"))));

    var ghOK = !!(getGH().repo && localStorage.getItem(LS_TOKEN));
    c.appendChild(h("div", { class: "banner " + (ghOK ? "ok" : ""), style: "margin-top:20px" },
      h("span", { class: "grow" }, ghOK ? "✓ เชื่อมต่อ GitHub แล้ว — กด Publish เพื่อขึ้นเว็บได้ทันที" : "ยังไม่ได้ตั้งค่า Publish — ไปที่หน้า ‘Publish / Deploy’ เพื่อเชื่อม GitHub (ทำครั้งเดียว)")));
  }
  function stat(n, l) { return h("div", { class: "stat" }, h("div", { class: "n" }, n), h("div", { class: "l" }, l)); }

  /* ---------- articles ---------- */
  function articlesView(c) {
    var bar = h("div", { class: "section-title" },
      h("div", { class: "filter-tabs" },
        ftab("all", "ทั้งหมด"), ftab("market-ideas", "Market Ideas"), ftab("field-notes", "Field Notes")),
      h("button", { class: "btn btn-accent", onclick: function () { editArticle(null); } }, "✎ เขียนบทความใหม่"));
    c.appendChild(bar);

    var list = h("div", { class: "alist" });
    var arts = (work.articles || []).map(function (a, i) { return { a: a, i: i }; })
      .filter(function (x) { return artFilter === "all" || x.a.category === artFilter; });
    if (!arts.length) list.appendChild(h("div", { class: "hint" }, "ยังไม่มีบทความในหมวดนี้ — กด ‘เขียนบทความใหม่’"));
    arts.forEach(function (x) {
      var a = x.a;
      var thumb = h("div", { class: "thumb" }); if (a.cover) thumb.style.backgroundImage = "url('" + a.cover + "')";
      list.appendChild(h("div", { class: "arow" },
        thumb,
        h("div", { class: "info" },
          h("div", { class: "ti" }, a.title || "(ไม่มีชื่อ)"),
          h("div", { class: "me" },
            h("span", { class: "pill cat" }, a.category === "market-ideas" ? "Market Ideas" : "Field Notes"), " ",
            h("span", { class: "pill " + (a.published !== false ? "green" : "gray") }, a.published !== false ? "เผยแพร่" : "ฉบับร่าง"),
            "  " + (a.date || ""))),
        h("div", { class: "acts" },
          iconBtn("↑", function () { move(work.articles, x.i, -1); renderView("articles"); }),
          iconBtn("↓", function () { move(work.articles, x.i, 1); renderView("articles"); }),
          h("button", { class: "btn btn-ghost btn-sm", onclick: function () { editArticle(x.i); } }, "แก้ไข"),
          h("button", { class: "btn btn-danger btn-sm", onclick: function () { if (confirm("ลบบทความ ‘" + (a.title || "") + "’ ?")) { work.articles.splice(x.i, 1); onEdit(); renderView("articles"); toast("ลบบทความแล้ว"); } } }, "ลบ"))));
    });
    c.appendChild(list);
  }
  function ftab(key, label) { return h("button", { class: artFilter === key ? "active" : "", onclick: function () { artFilter = key; renderView("articles"); } }, label); }

  function editArticle(index) {
    var isNew = index == null;
    var a = isNew
      ? { id: "a-" + Date.now(), category: "market-ideas", slug: "", title: "", excerpt: "", cover: null, ph: "ph-1", date: new Date().toISOString().slice(0, 10), readMin: 5, featured: false, published: true, body: "" }
      : clone(work.articles[index]);

    var body = $("#modalBody"); body.innerHTML = "";
    $("#modalTitle").textContent = isNew ? "เขียนบทความใหม่" : "แก้ไขบทความ";

    function field(label, ctrl, sub) { return h("div", { class: "field" }, h("label", {}, label, sub ? h("span", { class: "sub" }, "  " + sub) : null), ctrl); }
    var titleInp = h("input", { class: "input", value: a.title, oninput: function (e) { a.title = e.target.value; if (isNew && !slugTouched) { slugInp.value = slugify(a.title); a.slug = slugInp.value; } } });
    var slugTouched = false;
    var slugInp = h("input", { class: "input", value: a.slug, oninput: function (e) { a.slug = e.target.value; slugTouched = true; } });
    var catSel = h("select", { class: "select", onchange: function (e) { a.category = e.target.value; } });
    [["market-ideas", "Market Ideas"], ["field-notes", "Field Notes"]].forEach(function (o) { var op = h("option", { value: o[0] }, o[1]); if (a.category === o[0]) op.selected = true; catSel.appendChild(op); });
    var dateInp = h("input", { class: "input", type: "date", value: a.date, oninput: function (e) { a.date = e.target.value; } });
    var readInp = h("input", { class: "input", type: "number", value: a.readMin, oninput: function (e) { a.readMin = Number(e.target.value) || 0; } });
    var exInp = h("textarea", { class: "textarea", oninput: function (e) { a.excerpt = e.target.value; } }); exInp.value = a.excerpt || "";

    // cover image (reuse imageField on a temp object)
    var coverWrap = h("div");
    var coverPrev = h("div", { class: "imgprev" });
    function paintCover() { if (a.cover) { coverPrev.style.backgroundImage = "url('" + a.cover + "')"; coverPrev.textContent = ""; } else { coverPrev.style.backgroundImage = ""; coverPrev.textContent = "ไม่มีรูป"; } }
    var coverFile = h("input", { type: "file", accept: "image/*", class: "input", onchange: function (e) { var f = e.target.files[0]; if (!f) return; if (f.size > 1500000) toast("รูปใหญ่กว่า 1.5MB — แนะนำย่อก่อน", "err"); var r = new FileReader(); r.onload = function () { a.cover = r.result; paintCover(); }; r.readAsDataURL(f); } });
    var coverUrl = h("input", { class: "input", type: "text", placeholder: "หรือวาง URL รูป", value: (a.cover && a.cover.slice(0, 5) !== "data:") ? a.cover : "", oninput: function (e) { a.cover = e.target.value || null; paintCover(); } });
    var coverClr = h("button", { class: "btn btn-ghost btn-sm", onclick: function () { a.cover = null; coverUrl.value = ""; paintCover(); } }, "ลบรูป");
    paintCover();
    coverWrap.appendChild(h("div", { class: "imgfield" }, coverPrev, h("div", { class: "col" }, coverFile, coverUrl, h("div", {}, coverClr))));

    var phSel = h("select", { class: "select", onchange: function (e) { a.ph = e.target.value; } });
    [["ph-1", "เขียวน้ำเงิน"], ["ph-2", "ทอง"], ["ph-3", "ฟ้าน้ำทะเล"], ["ph-4", "ม่วง"], ["ph-5", "แดงเลือดหมู"], ["ph-6", "เขียวมรกต"]].forEach(function (o) { var op = h("option", { value: o[0] }, o[1]); if (a.ph === o[0]) op.selected = true; phSel.appendChild(op); });

    var pubInp = h("input", { class: "sw", type: "checkbox" }); pubInp.checked = a.published !== false; pubInp.addEventListener("change", function (e) { a.published = e.target.checked; });
    var featInp = h("input", { class: "sw", type: "checkbox" }); featInp.checked = !!a.featured; featInp.addEventListener("change", function (e) { a.featured = e.target.checked; });

    var prev = h("div", { class: "preview-pane", html: md(a.body) });
    var bodyTa = h("textarea", { class: "textarea code", style: "min-height:420px", oninput: function (e) { a.body = e.target.value; prev.innerHTML = md(a.body); } }); bodyTa.value = a.body || "";

    body.appendChild(field("ชื่อบทความ", titleInp));
    body.appendChild(h("div", { class: "row" }, field("หมวดหมู่", catSel), field("Slug (URL)", slugInp, "ภาษาอังกฤษ ไม่เว้นวรรค")));
    body.appendChild(h("div", { class: "row-3" }, field("วันที่", dateInp), field("เวลาอ่าน (นาที)", readInp), field("สีพื้นหลัง (ตอนไม่มีรูป)", phSel)));
    body.appendChild(field("คำโปรย / สรุปสั้น", exInp));
    body.appendChild(field("รูปปก", coverWrap, "ไม่ใส่ก็ได้ — จะใช้พื้นหลังไล่สีแทน"));
    body.appendChild(h("div", { style: "display:flex;gap:24px;margin:6px 0 14px" },
      h("label", { class: "check" }, pubInp, h("span", { class: "switch" }), "เผยแพร่"),
      h("label", { class: "check" }, featInp, h("span", { class: "switch" }), "บทความเด่น")));
    body.appendChild(h("div", { class: "field" }, h("label", {}, "เนื้อหา (เขียนด้วย Markdown — ## หัวข้อ, ** ตัวหนา **, - รายการ, > คำคม)"),
      h("div", { class: "editor-split" }, bodyTa, prev)));

    var foot = $("#modalFoot"); foot.innerHTML = "";
    foot.appendChild(h("button", { class: "btn btn-ghost", onclick: closeModal }, "ยกเลิก"));
    foot.appendChild(h("button", { class: "btn btn-accent", onclick: function () {
      if (!a.title.trim()) { toast("กรุณาใส่ชื่อบทความ", "err"); return; }
      if (!a.slug.trim()) a.slug = slugify(a.title);
      if (!work.articles) work.articles = [];
      // ensure slug unique
      var dup = work.articles.some(function (x, i) { return x.slug === a.slug && i !== index; });
      if (dup) a.slug = a.slug + "-" + Math.floor(Math.random() * 1000);
      if (isNew) work.articles.unshift(a); else work.articles[index] = a;
      onEdit(); closeModal(); renderView("articles"); toast(isNew ? "เพิ่มบทความแล้ว ✓" : "บันทึกบทความแล้ว ✓", "ok");
    } }, isNew ? "เพิ่มบทความ" : "บันทึก"));

    openModal();
  }

  function openModal() { $("#modal").classList.add("show"); }
  function closeModal() { $("#modal").classList.remove("show"); }

  /* ---------- deploy / publish ---------- */
  function getGH() { try { return JSON.parse(localStorage.getItem(LS_GH) || "{}"); } catch (e) { return {}; } }
  function setGH(o) { localStorage.setItem(LS_GH, JSON.stringify(o)); }

  function deployView(c) {
    var gh = getGH();
    var token = localStorage.getItem(LS_TOKEN) || "";

    c.appendChild(h("div", { class: "banner ok" }, h("span", { class: "grow" },
      "เชื่อม GitHub ครั้งเดียว แล้วทุกครั้งที่กด Publish เว็บจะอัปเดตอัตโนมัติ (host จะ build ให้เอง)")));

    var box = h("div", { class: "card card-pad" });
    box.appendChild(h("h2", { style: "margin-bottom:6px" }, "เชื่อมต่อ GitHub"));
    box.appendChild(h("p", { class: "hint", style: "margin-bottom:18px" }, "ดูวิธีสร้าง Token แบบ step-by-step ได้ในไฟล์ README.md (หัวข้อ ‘ตั้งค่า Publish’)"));

    function gfield(label, key, ph, type) {
      var inp = h("input", { class: "input", type: type || "text", value: gh[key] || "", placeholder: ph, oninput: function (e) { gh[key] = e.target.value; setGH(gh); } });
      return h("div", { class: "field" }, h("label", {}, label), inp);
    }
    box.appendChild(h("div", { class: "row" },
      gfield("GitHub Username/Org", "owner", "เช่น apinan"),
      gfield("ชื่อ Repository", "repo", "เช่น yoapinan-website")));
    box.appendChild(h("div", { class: "row" },
      gfield("Branch", "branch", "main"),
      gfield("ตำแหน่งไฟล์ข้อมูล", "path", "content.js")));

    var tokenInp = h("input", { class: "input", type: "password", value: token, placeholder: "ghp_xxx (เก็บไว้ในเครื่องนี้เท่านั้น)", oninput: function (e) { localStorage.setItem(LS_TOKEN, e.target.value.trim()); } });
    box.appendChild(h("div", { class: "field" }, h("label", {}, "GitHub Token (fine-grained, สิทธิ์ Contents: Read & Write)"),
      tokenInp, h("div", { class: "hint", style: "margin-top:6px" }, "🔒 Token ถูกเก็บไว้ใน browser ของคุณเท่านั้น ไม่ถูกส่งไปที่อื่นนอกจาก GitHub")));

    box.appendChild(h("div", { style: "display:flex;gap:10px;flex-wrap:wrap;margin-top:6px" },
      h("button", { class: "btn btn-ghost", onclick: testGH }, "🔌 ทดสอบการเชื่อมต่อ"),
      h("button", { class: "btn btn-accent", onclick: publishGH }, "🚀 Publish ขึ้นเว็บเดี๋ยวนี้")));
    c.appendChild(box);

    // manual fallback
    var box2 = h("div", { class: "card card-pad", style: "margin-top:20px" });
    box2.appendChild(h("h2", { style: "margin-bottom:6px" }, "ทางเลือกแบบ manual"));
    box2.appendChild(h("p", { class: "hint", style: "margin-bottom:16px" }, "ถ้ายังไม่อยากต่อ GitHub: ดาวน์โหลดไฟล์ข้อมูลแล้วเอาไปวางทับ content.js เอง / หรือนำเข้าไฟล์เดิมมาแก้ต่อ"));
    var importInp = h("input", { type: "file", accept: ".js,.json,.txt", style: "display:none", onchange: function (e) { importFile(e.target.files[0]); } });
    box2.appendChild(h("div", { style: "display:flex;gap:10px;flex-wrap:wrap" },
      h("button", { class: "btn btn-ghost", onclick: downloadContent }, "⬇ ดาวน์โหลด content.js"),
      h("button", { class: "btn btn-ghost", onclick: function () { importInp.click(); } }, "⬆ นำเข้าไฟล์ (Import)"),
      importInp));
    c.appendChild(box2);
  }

  function genFileText(obj) {
    return "/* YoApinan.com content store — generated by CMS on " + new Date().toISOString() + " */\n" +
      "window.SITE_CONTENT = " + JSON.stringify(obj, null, 2) + ";\n";
  }
  function utf8b64(str) { return btoa(unescape(encodeURIComponent(str))); }

  function downloadContent() {
    var blob = new Blob([genFileText(work)], { type: "text/javascript" });
    var u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = "content.js"; a.click(); URL.revokeObjectURL(u);
    toast("ดาวน์โหลดแล้ว — นำไปวางทับไฟล์ content.js", "ok");
  }
  function importFile(f) {
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var txt = String(r.result), s = txt.indexOf("{"), e = txt.lastIndexOf("}");
        var obj = JSON.parse(txt.slice(s, e + 1));
        work = obj; onEdit(); renderView(current); toast("นำเข้าข้อมูลสำเร็จ ✓", "ok");
      } catch (err) { toast("ไฟล์ไม่ถูกต้อง: " + err.message, "err"); }
    };
    r.readAsText(f);
  }

  function ghHeaders() { return { "Accept": "application/vnd.github+json", "Authorization": "token " + (localStorage.getItem(LS_TOKEN) || ""), "X-GitHub-Api-Version": "2022-11-28" }; }
  function ghContentsUrl() {
    var gh = getGH();
    var path = (gh.path || "content.js").replace(/^\/+/, "");
    return "https://api.github.com/repos/" + encodeURIComponent(gh.owner) + "/" + encodeURIComponent(gh.repo) +
      "/contents/" + path.split("/").map(encodeURIComponent).join("/");
  }
  function ghValid() {
    var gh = getGH();
    if (!gh.owner || !gh.repo) { toast("กรุณากรอก Username และ Repository", "err"); return false; }
    if (!localStorage.getItem(LS_TOKEN)) { toast("กรุณากรอก GitHub Token", "err"); return false; }
    return true;
  }

  function testGH() {
    if (!ghValid()) return;
    var gh = getGH();
    toast("กำลังตรวจสอบ…");
    fetch("https://api.github.com/repos/" + encodeURIComponent(gh.owner) + "/" + encodeURIComponent(gh.repo), { headers: ghHeaders() })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j, status: r.status }; }); })
      .then(function (res) {
        if (res.ok) toast("✓ เชื่อมต่อสำเร็จ: " + res.j.full_name, "ok");
        else toast("เชื่อมต่อไม่สำเร็จ (" + res.status + "): " + (res.j.message || ""), "err");
      })
      .catch(function (e) { toast("ผิดพลาด: " + e.message, "err"); });
  }

  function publishGH() {
    if (!ghValid()) return;
    var gh = getGH(), branch = gh.branch || "main";
    var url = ghContentsUrl();
    var fileText = genFileText(work);
    toast("กำลัง Publish…");
    $("#btnPublish").setAttribute("disabled", "");
    // 1) get sha (if file exists)
    fetch(url + "?ref=" + encodeURIComponent(branch), { headers: ghHeaders() })
      .then(function (r) { return r.status === 200 ? r.json() : null; })
      .then(function (existing) {
        var payload = { message: "CMS: update content " + new Date().toISOString(), content: utf8b64(fileText), branch: branch };
        if (existing && existing.sha) payload.sha = existing.sha;
        return fetch(url, { method: "PUT", headers: ghHeaders(), body: JSON.stringify(payload) })
          .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j, status: r.status }; }); });
      })
      .then(function (res) {
        $("#btnPublish").removeAttribute("disabled");
        if (res.ok) {
          SOURCE = clone(work);
          localStorage.removeItem(LS_DRAFT);
          refreshStatus("เผยแพร่แล้ว ✓");
          toast("🚀 Publish สำเร็จ! เว็บกำลังอัปเดต (รอ host build ~1-2 นาที)", "ok");
        } else {
          toast("Publish ไม่สำเร็จ (" + res.status + "): " + (res.j.message || ""), "err");
        }
      })
      .catch(function (e) { $("#btnPublish").removeAttribute("disabled"); toast("ผิดพลาด: " + e.message, "err"); });
  }

  /* ---------- draft / preview ---------- */
  function saveDraft() {
    localStorage.setItem(LS_DRAFT, JSON.stringify({ at: Date.now(), content: work }));
    refreshStatus("บันทึกร่างแล้ว " + new Date().toLocaleTimeString("th-TH"));
    toast("บันทึกร่างในเครื่องแล้ว ✓", "ok");
  }
  function doPreview() {
    try { localStorage.setItem("ya_preview_content", JSON.stringify(work)); } catch (e) { toast("ข้อมูลใหญ่เกินไปสำหรับ preview (รูปเยอะ)", "err"); return; }
    window.open("index.html?preview=1", "_blank");
  }

  function loadDraftIfAny() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_DRAFT) || "null");
      if (d && d.content) { work = d.content; }
    } catch (e) {}
  }

  /* ---------- boot ---------- */
  function boot() {
    if (!window.SITE_CONTENT) { document.getElementById("view").innerHTML = "<p style='padding:20px'>ไม่พบ content.js</p>"; }
    loadDraftIfAny();
    renderNav();
    renderView("dashboard");

    $("#btnPreview").addEventListener("click", doPreview);
    $("#btnSaveDraft").addEventListener("click", saveDraft);
    $("#btnPublish").addEventListener("click", function () {
      if (getGH().repo && localStorage.getItem(LS_TOKEN)) publishGH();
      else { toast("ตั้งค่า GitHub ก่อน Publish", "err"); go("deploy"); }
    });
    $("#menuBtn").addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    $("#modalClose").addEventListener("click", closeModal);
    $("#modal").addEventListener("click", function (e) { if (e.target.id === "modal") closeModal(); });

    // warn before leaving with unsaved changes
    window.addEventListener("beforeunload", function (e) {
      if (dirty()) { e.preventDefault(); e.returnValue = ""; }
    });

    var d = JSON.parse(localStorage.getItem(LS_DRAFT) || "null");
    if (d && d.at) refreshStatus("โหลดร่างล่าสุด " + new Date(d.at).toLocaleString("th-TH"));
  }

  /* ---------- passcode gate (deterrent; real lock = GitHub token) ---------- */
  var ADMIN_HASH = "77e39da95a4c3ec995b89b5c03e6af9345f140c384d25d72850e7dc756adba0d";
  async function sha256hex(str) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }
  function gateThen(cb) {
    // skip on local file preview / no WebCrypto (own machine) — gate is for the public https page
    if (location.protocol === "file:" || !(window.crypto && crypto.subtle)) return cb();
    if (sessionStorage.getItem("ya_admin_ok") === "1") return cb();
    renderLock(cb);
  }
  function renderLock(cb) {
    var ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:#0B1320;display:flex;align-items:center;justify-content:center;padding:24px;font-family:var(--font)";
    ov.innerHTML =
      '<div style="width:100%;max-width:360px;text-align:center;color:#E8ECF1">' +
        '<img src="logo.svg" alt="" style="width:46px;height:46px;margin:0 auto 16px;border-radius:10px" onerror="this.style.display=\'none\'">' +
        '<div style="font-family:var(--font);font-weight:700;font-size:1.15rem;margin-bottom:4px;color:#fff">YoApinan CMS</div>' +
        '<div style="color:#9CA9B4;font-size:.9rem;margin-bottom:20px">ใส่รหัสผ่านเพื่อเข้าจัดการเนื้อหา</div>' +
        '<input id="lockPass" type="password" placeholder="รหัสผ่าน" autocomplete="current-password" style="width:100%;padding:.7rem .9rem;border-radius:10px;border:1px solid #2A3A4D;background:#111C2C;color:#fff;font-size:1rem;outline:none;box-sizing:border-box">' +
        '<div id="lockErr" style="color:#E2766B;font-size:.85rem;min-height:1.3em;margin:8px 0"></div>' +
        '<button id="lockBtn" style="width:100%;padding:.78rem;border-radius:10px;border:none;background:#C9A86A;color:#0B1320;font-weight:700;font-size:1rem;cursor:pointer">เข้าสู่ระบบ</button>' +
      "</div>";
    document.body.appendChild(ov);
    var inp = ov.querySelector("#lockPass"), err = ov.querySelector("#lockErr"), btn = ov.querySelector("#lockBtn");
    setTimeout(function () { inp.focus(); }, 60);
    async function tryUnlock() {
      btn.disabled = true; err.textContent = "";
      try {
        if (await sha256hex(inp.value) === ADMIN_HASH) { sessionStorage.setItem("ya_admin_ok", "1"); ov.remove(); cb(); return; }
      } catch (e) {}
      btn.disabled = false; err.textContent = "รหัสผ่านไม่ถูกต้อง"; inp.select();
    }
    btn.addEventListener("click", tryUnlock);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") tryUnlock(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { gateThen(boot); });
  else gateThen(boot);
})();
