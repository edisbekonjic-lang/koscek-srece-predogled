/* Košček sreče – zagon: podatke iz config.js vpiše v stran, nato zažene module. */
(function () {
  "use strict";
  var KS = window.KS, U = KS.util, cfg = KS.cfg, $ = U.$;

  function fmt(v, f) {
    if (f === "eur") { return U.eur(v); }
    if (f === "eurShort") { return U.eurShort(v); }
    if (f === "cm") { return U.num(v) + " cm"; }
    if (f === "dni") { return v + " dni"; }
    return String(v);
  }

  /* <span data-cfg="prodajalec.naziv" data-manjka="naziv prodajalca" data-format="eur"> */
  function fillConfig() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-cfg]"), function (el) {
      var v = U.cfgGet(el.getAttribute("data-cfg"));
      el.innerHTML = "";
      if (v == null || v === "") { el.appendChild(U.todo(el.getAttribute("data-manjka") || "vpiše prodajalec")); }
      else { el.textContent = fmt(v, el.getAttribute("data-format")); }
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-cfg-href]"), function (el) {
      var v = U.cfgGet(el.getAttribute("data-cfg-href"));
      if (v) { el.href = v; }
      else { el.removeAttribute("href"); el.appendChild(document.createTextNode(" ")); el.appendChild(U.todo("povezava")); }
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-rok]"), function (el) { el.textContent = U.rokIzdelave(); });
    var m = $("mailLink");
    if (m) { if (cfg.prodajalec.email) { m.href = "mailto:" + cfg.prodajalec.email; } else { m.removeAttribute("href"); } }
  }

  /* razpon širine "__ do __ cm" iz dveh vrednosti */
  function fillRange() {
    var el = $("sirinaOut"); if (!el) { return; }
    var a = cfg.mere.sirinaOdCm, b = cfg.mere.sirinaDoCm;
    el.innerHTML = "";
    if (a != null && b != null) { el.textContent = U.num(a) + " do " + U.num(b) + " cm"; }
    else { el.appendChild(U.todo("__ do __ cm")); }
  }

  function fillCenik() {
    var t = $("cenik"); if (!t) { return; }
    for (var n = 1; n <= cfg.cenik.najvecCrk; n++) {
      var c = U.cenaZa(n); if (c == null) { continue; }
      var r = t.insertRow(); r.insertCell().textContent = n;
      var a = r.insertCell(); a.className = "r"; a.textContent = U.eur(c);
      var b = r.insertCell(); b.className = "r"; b.textContent = U.eur(c / n);
    }
  }

  function fillGallery() {
    var g = $("gal"); if (!g) { return; }
    cfg.galerija.forEach(function (it) {
      var f = document.createElement("figure"); f.className = "tile" + (it.velika ? " big" : "");
      var im = document.createElement("img"); im.src = it.slika; im.alt = it.alt; im.loading = "lazy";
      var c = document.createElement("figcaption"); c.textContent = it.podpis;
      f.appendChild(im); f.appendChild(c); g.appendChild(f);
    });
    var more = $("galMore");
    if (cfg.prodajalec.instagram) { more.href = cfg.prodajalec.instagram; } else { more.hidden = true; }
  }

  /* seznam manjkajočih podatkov (prikaže se le, če kaj manjka) */
  function fillMissing() {
    var box = $("manjka"); if (!box) { return; }
    var items = [
      [cfg.mere.visinaCm == null || cfg.mere.sirinaOdCm == null || cfg.mere.debelinaCm == null || cfg.mere.razmikCm == null, "mere črk (višina, širina, debelina, razmik)"],
      [cfg.mere.material == null, "material črk"],
      [cfg.dostava.cenaPodPragom == null, "cena dostave pod " + U.eurShort(cfg.dostava.pragBrezplacne)],
      [cfg.predracun.iban == null || cfg.predracun.rokVeljavnostiDni == null, "IBAN in rok veljavnosti predračuna"],
      [cfg.prodajalec.naziv == null || cfg.prodajalec.naslov == null || cfg.prodajalec.maticna == null || cfg.prodajalec.davcna == null, "naziv, naslov, matična in davčna številka prodajalca"]
    ].filter(function (x) { return x[0]; });
    if (!items.length) { box.hidden = true; return; }
    var ul = box.querySelector("ul"); ul.innerHTML = "";
    items.forEach(function (x) { var li = document.createElement("li"); li.textContent = x[1]; ul.appendChild(li); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillConfig(); fillRange(); fillCenik(); fillGallery(); fillMissing();
    if ($("stage")) { KS.configurator.init(); KS.checkout.init(); }
  });
})();
