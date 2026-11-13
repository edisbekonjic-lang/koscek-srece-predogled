/* Košček sreče – pomožne funkcije in skupno stanje. Naloži se za config.js. */
(function () {
  "use strict";
  var KS = (window.KS = window.KS || {});
  var cfg = window.KS_CONFIG;
  if (!cfg) { throw new Error("config.js ni naložen"); }
  KS.cfg = cfg;

  /* Stanje konfiguratorja; spreminjata ga configurator.js in preview.js. */
  KS.state = {
    text: "",
    cols: [],
    sel: 0,
    scene: cfg.podlage[0].id,
    wall: cfg.stene[0].hex,
    allMode: false,
    photo: { url: null, w: 0, h: 0, dark: false },
    pscale: 1,
    offX: 0,
    offY: 0,
    orderNo: ""
  };

  var allowed = new RegExp("[^" + cfg.napis.dovoljeniZnaki + "]", "g");

  KS.util = {
    $: function (id) { return document.getElementById(id); },

    /* 24.9 -> "24,90 €" */
    eur: function (v) { return (Math.round(v * 100 + 1e-6) / 100).toFixed(2).replace(".", ",") + " €"; },

    /* 50 -> "50 €", 9.9 -> "9,90 €" (za pragove in zaokrožene zneske) */
    eurShort: function (v) { return v % 1 === 0 ? v + " €" : KS.util.eur(v); },

    /* zaokroži na pol enote: 22.3 -> "22,5" */
    num: function (v) { return (Math.round(v * 2) / 2).toString().replace(".", ","); },

    rgb: function (hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; },
    mix: function (hex, t, to) {
      var c = KS.util.rgb(hex);
      return "rgb(" + c.map(function (v) { return Math.round(v + (to - v) * t); }).join(",") + ")";
    },
    lum: function (hex) { var c = KS.util.rgb(hex); return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000; },

    /* očisti vnos napisa: velike črke, dovoljeni znaki, en presledek, omejitev dolžine */
    clean: function (s) {
      return s.toUpperCase().replace(allowed, "").replace(/\s+/g, " ").replace(/^ /, "").slice(0, cfg.napis.najvecZnakov);
    },

    /* sklanjanje: 1 črka, 2 črki, 3–4 črke, 5+ črk */
    crk: function (n) { return n + (n === 1 ? " črka" : n === 2 ? " črki" : n === 3 || n === 4 ? " črke" : " črk"); },

    /* "3–6 delovnih dni" iz configa */
    rokIzdelave: function () { return cfg.izdelava.delovnihDniOd + "–" + cfg.izdelava.delovnihDniDo + " delovnih dni"; },

    /* cena iz cenika ali null, če je črk več, kot jih cenik pokriva (ali nič) */
    cenaZa: function (n) { var c = cfg.cenik.cene[String(n)]; return typeof c === "number" ? c : null; },

    /* vrednost iz configa po poti "prodajalec.naziv" */
    cfgGet: function (path) {
      return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, cfg);
    },

    /* <span class="todo">…</span> za manjkajoč podatek */
    todo: function (label) {
      var s = document.createElement("span"); s.className = "todo"; s.textContent = label; return s;
    },

    /* napolni <dl> s pari [oznaka, vrednost] */
    dl: function (el, rows) {
      el.innerHTML = "";
      rows.forEach(function (r) {
        var dt = document.createElement("dt"), dd = document.createElement("dd");
        dt.textContent = r[0];
        if (r[1] && r[1].nodeType) { dd.appendChild(r[1]); } else { dd.textContent = r[1]; }
        el.appendChild(dt); el.appendChild(dd);
      });
    }
  };
})();
