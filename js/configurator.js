/* Košček sreče – konfigurator: vnos napisa, barve, podlaga, fotografija, povzetek. */
(function () {
  "use strict";
  var KS = window.KS, st = KS.state, U = KS.util, cfg = KS.cfg, $ = U.$;
  var input, pal;

  var letters = KS.preview.letters;
  function price() { return U.cenaZa(letters().length); }

  function shipText(p) {
    if (!p) { return "po dogovoru"; }
    if (p >= cfg.dostava.pragBrezplacne) { return "brezplačna"; }
    return cfg.dostava.cenaPodPragom != null ? U.eur(cfg.dostava.cenaPodPragom) : "po ceniku dostave";
  }
  function totalText(p) {
    if (!p) { return "po dogovoru"; }
    if (p >= cfg.dostava.pragBrezplacne) { return U.eur(p); }
    return cfg.dostava.cenaPodPragom != null ? U.eur(p + cfg.dostava.cenaPodPragom) : U.eur(p) + " + dostava";
  }
  function colourLine() {
    return letters().map(function (i) { return st.text[i] + " " + cfg.paleta[st.cols[i]].ime.toLowerCase(); }).join(", ");
  }

  /* seznam "črka · barva" v <ul class="pairs"> */
  function pairsInto(ul) {
    ul.innerHTML = "";
    var L = letters();
    L.forEach(function (i) {
      var c = cfg.paleta[st.cols[i]], li = document.createElement("li"), b = document.createElement("b");
      b.style.background = c.hex; b.style.color = U.lum(c.hex) > 170 ? "#27283a" : "#fff"; b.textContent = st.text[i];
      li.appendChild(b); li.appendChild(document.createTextNode(c.ime)); ul.appendChild(li);
    });
    if (!L.length) { var li = document.createElement("li"); li.textContent = "Napis še ni vpisan"; ul.appendChild(li); }
  }

  function setText(v) {
    var t = U.clean(v), old = st.cols.slice();
    st.cols = [];
    for (var i = 0; i < t.length; i++) {
      st.cols[i] = old[i] != null ? old[i] : (st.allMode && old.length ? old[0] : cfg.zacetneBarve[i % cfg.zacetneBarve.length]);
    }
    st.text = t;
    var L = letters();
    if (L.indexOf(st.sel) < 0) { st.sel = L.length ? L[L.length - 1] : 0; }
    render();
  }

  function render() {
    var d = KS.preview.draw(), L = letters(), n = L.length, p = price(), cur = st.cols[st.sel];

    var lc = $("lchips"); lc.innerHTML = ""; lc.hidden = st.allMode || !n;
    L.forEach(function (i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "lchip"; b.textContent = st.text[i];
      b.style.setProperty("--c", cfg.paleta[st.cols[i]].hex);
      b.setAttribute("aria-pressed", i === st.sel ? "true" : "false");
      b.setAttribute("aria-label", "Črka " + st.text[i] + ", " + cfg.paleta[st.cols[i]].ime);
      b.addEventListener("click", function () { st.sel = i; render(); });
      lc.appendChild(b);
    });
    for (var k = 0; k < pal.children.length; k++) {
      var on = n && k === cur;
      pal.children[k].classList.toggle("on", !!on);
      pal.children[k].setAttribute("aria-pressed", on ? "true" : "false");
    }

    pairsInto($("pairs")); pairsInto($("pairs2"));
    $("price").textContent = !n ? "" : (p ? U.eur(p) : "po dogovoru");
    $("perLetter").innerHTML = !n ? "" : (p
      ? "<strong>" + U.crk(n) + ":</strong> " + U.eur(p / n) + " na črko"
      : "<strong>Več kot " + cfg.cenik.najvecCrk + " črk:</strong> ceno potrdimo v odgovoru");
    $("sizeOut").innerHTML = d
      ? "<strong>Velikost:</strong> približno " + U.num(d.Wcm) + " × " + U.num(d.V) + " cm" +
        (KS.preview.heightIsExample() ? " (primer višine " + U.num(d.V) + " cm)" : "")
      : "";
    var prag = cfg.dostava.pragBrezplacne;
    $("ship").innerHTML = (p && p >= prag)
      ? "<strong>Dostava:</strong> brezplačna"
      : (p ? "<strong>Dostava:</strong> do brezplačne manjka še " + U.eur(prag - p)
           : "<strong>Dostava:</strong> brezplačna nad " + U.eurShort(prag));
    $("count").textContent = n ? U.crk(n) + " · cenik velja do " + cfg.cenik.najvecCrk + " črk" : "Vpiši vsaj eno črko";
    U.dl($("sideSum"), [
      ["Napis", st.text || "–"],
      ["Črke", p ? U.eur(p) : (n ? "po dogovoru" : "–")],
      ["Dostava", n ? shipText(p) : "–"],
      ["Za plačilo", n ? totalText(p) : "–"]
    ]);
    if (input.value !== st.text) { input.value = st.text; }
  }

  function setMode(all) {
    st.allMode = all;
    $("modeAll").setAttribute("aria-pressed", all ? "true" : "false");
    $("modeOne").setAttribute("aria-pressed", all ? "false" : "true");
    if (all) { var k = st.cols[st.sel]; letters().forEach(function (i) { st.cols[i] = k; }); }
    render();
  }

  function setWall(hex, btn) {
    st.wall = hex;
    Array.prototype.forEach.call(document.querySelectorAll(".wall"), function (o) { o.setAttribute("aria-pressed", o === btn ? "true" : "false"); });
    render();
  }

  /* lastna fotografija */
  function avgDark(im) {
    try {
      var c = document.createElement("canvas"); c.width = c.height = 16;
      var g = c.getContext("2d"); g.drawImage(im, 0, 0, 16, 16);
      var d = g.getImageData(0, 0, 16, 16).data, t = 0;
      for (var i = 0; i < d.length; i += 4) { t += (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000; }
      return t / (d.length / 4) < 110;
    } catch (e) { return false; }
  }
  function loadPhoto(file) {
    if (!file || !/^image\//.test(file.type)) { return; }
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      if (st.photo.url) { URL.revokeObjectURL(st.photo.url); }
      st.photo = { url: url, w: im.naturalWidth || im.width, h: im.naturalHeight || im.height, dark: avgDark(im) };
      st.offX = 0; st.offY = 0; st.pscale = 1; $("scaleRange").value = 100;
      $("photoClear").hidden = false; $("photoScale").hidden = false;
      render();
    };
    im.onerror = function () { URL.revokeObjectURL(url); };
    im.src = url;
  }

  function buildPalette() {
    cfg.paleta.forEach(function (c, k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "sw";
      var i = document.createElement("i"); i.style.background = c.hex;
      b.appendChild(i); b.appendChild(document.createTextNode(c.ime));
      b.addEventListener("click", function () {
        var L = letters(); if (!L.length) { return; }
        if (st.allMode) { L.forEach(function (i) { st.cols[i] = k; }); }
        else { st.cols[st.sel] = k; var p = L.indexOf(st.sel); if (p < L.length - 1) { st.sel = L[p + 1]; } }
        render();
      });
      pal.appendChild(b);
    });
  }

  function buildScenes() {
    cfg.podlage.forEach(function (sc) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = sc.ime;
      b.setAttribute("aria-pressed", sc.id === st.scene ? "true" : "false");
      b.addEventListener("click", function () {
        st.scene = sc.id;
        $("wallBox").hidden = !sc.barvaStene;
        $("photoBox").hidden = sc.id !== "foto";
        Array.prototype.forEach.call($("scenes").children, function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        render();
      });
      $("scenes").appendChild(b);
    });
    $("wallBox").hidden = !cfg.podlage[0].barvaStene;
    $("photoBox").hidden = cfg.podlage[0].id !== "foto";
  }

  function buildWalls() {
    cfg.stene.forEach(function (w, k) {
      var b = document.createElement("button"); b.type = "button"; b.className = "wall"; b.style.background = w.hex;
      b.title = w.ime; b.setAttribute("aria-label", "Stena: " + w.ime); b.setAttribute("aria-pressed", k === 0 ? "true" : "false");
      b.addEventListener("click", function () { setWall(w.hex, b); });
      $("walls").appendChild(b);
    });
    var l = document.createElement("label"); l.className = "custom"; l.htmlFor = "wallCustom"; l.textContent = "Po meri";
    var c = document.createElement("input"); c.type = "color"; c.id = "wallCustom"; c.value = "#c7dae8";
    c.addEventListener("input", function () { setWall(c.value, null); });
    l.appendChild(c); $("walls").appendChild(l);
  }

  function init() {
    input = $("napis"); pal = $("pal");
    KS.preview.init(function (i) { st.sel = i; render(); });
    buildPalette(); buildScenes(); buildWalls();

    $("modeOne").addEventListener("click", function () { setMode(false); });
    $("modeAll").addEventListener("click", function () { setMode(true); });
    input.addEventListener("input", function () { setText(input.value); });
    $("mere-on").addEventListener("change", render);
    $("rand").addEventListener("click", function () {
      setMode(false);
      var last = -1;
      letters().forEach(function (i) {
        var k; do { k = Math.floor(Math.random() * cfg.paleta.length); } while (k === last);
        st.cols[i] = k; last = k;
      });
      render();
    });

    ["photoCam", "photoFile"].forEach(function (id) {
      $(id).addEventListener("change", function () { loadPhoto(this.files[0]); this.value = ""; });
    });
    $("photoClear").addEventListener("click", function () {
      if (st.photo.url) { URL.revokeObjectURL(st.photo.url); }
      st.photo = { url: null, w: 0, h: 0, dark: false };
      $("photoClear").hidden = true; $("photoScale").hidden = true;
      render();
    });
    $("scaleRange").addEventListener("input", function () { st.pscale = this.value / 100; render(); });
    window.addEventListener("resize", render);

    setText(input.value);
    if (document.fonts && document.fonts.load) { document.fonts.load(KS.preview.FONT).then(render, function () {}); }
  }

  KS.configurator = {
    init: init, render: render, setText: setText, letters: letters, price: price,
    pairsInto: pairsInto, colourLine: colourLine, shipText: shipText, totalText: totalText
  };
})();
