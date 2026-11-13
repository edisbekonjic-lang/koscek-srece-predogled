/* Košček sreče – SVG predogled napisa s kotiranjem in vlečenjem po fotografiji. */
(function () {
  "use strict";
  var KS = window.KS, st = KS.state, U = KS.util, cfg = KS.cfg, $ = U.$;
  var FONT = "800 100px 'Baloo 2','Arial Rounded MT Bold','Trebuchet MS',sans-serif";
  var cv = document.createElement("canvas").getContext("2d");
  var stage, wordEl, onPick;
  var drag = null, moved = false;

  /* višina črke: izmerjena iz configa ali primer, dokler je ni */
  function heightCm() { return cfg.mere.visinaCm != null ? cfg.mere.visinaCm : cfg.mere.primerVisineCm; }
  function heightIsExample() { return cfg.mere.visinaCm == null; }

  function letters() {
    var a = [];
    for (var i = 0; i < st.text.length; i++) { if (st.text[i] !== " ") { a.push(i); } }
    return a;
  }

  function layout() {
    cv.font = FONT;
    var cap = cv.measureText("H").actualBoundingBoxAscent || 70, x = 0, items = [], gap = 11;
    for (var i = 0; i < st.text.length; i++) {
      if (st.text[i] === " ") { x += 34; continue; }
      var w = cv.measureText(st.text[i]).width;
      items.push({ i: i, ch: st.text[i], x: x, w: w });
      x += w + gap;
    }
    return { cap: cap, W: Math.max(x - gap, 1), items: items };
  }

  /* nariše podlago in napis; vrne {Wcm, V} ali null, če napisa ni */
  function draw() {
    var foto = KS.scene.fotoMode(), sw = stage.clientWidth || 360;
    stage.classList.toggle("foto", foto);
    stage.style.height = foto
      ? Math.min(Math.max(Math.round(sw * st.photo.h / st.photo.w), 240), window.innerWidth >= 900 ? 520 : 460) + "px"
      : "";
    wordEl.style.transform = foto ? "translate(" + st.offX + "px," + st.offY + "px)" : "";
    $("scene").innerHTML = KS.scene.svg();

    var L = letters();
    if (!L.length) {
      wordEl.innerHTML = '<span class="empty">Vpiši napis in tukaj se prikaže predogled.</span>';
      return null;
    }
    var lay = layout(), show = $("mere-on").checked, sh = stage.clientHeight || 240;
    var padL = show ? 46 : 14, padR = 14, padT = 30, padB = show ? 40 : 14;
    var s = Math.min((sw - 20 - padL - padR) / (lay.W + 8), (sh - 56 - padT - padB) / lay.cap, 1.9);
    var V = heightCm();
    if (foto) {
      /* Ocena merila: fotografija z razdalje cfg.fotografija.razdaljaM pokrije približno
         pokritoCmPokoncno širine pokončno in pokritoCmLezece ležeče. Drsnik to popravi. */
      var cover = Math.max(sw / st.photo.w, sh / st.photo.h), shownW = st.photo.w * cover;
      var realCm = st.photo.w >= st.photo.h ? cfg.fotografija.pokritoCmLezece : cfg.fotografija.pokritoCmPokoncno;
      s = Math.max(0.08, (shownW / realCm) * V / lay.cap * st.pscale);
    }
    var mL = padL / s + 4, mR = padR / s + 4, mT = padT / s, mB = padB / s;
    var vbW = mL + lay.W + mR, vbH = mT + lay.cap + mB, base = mT + lay.cap;
    var Wcm = lay.W / lay.cap * V, fs = 12 / s, dk = KS.scene.darkBg();
    var lc = dk ? "#ffffff" : "#27283a", halo = dk ? "#27283a" : "#ffffff";

    var h = '<svg width="' + (vbW * s) + '" height="' + (vbH * s) + '" viewBox="0 0 ' + vbW + ' ' + vbH + '" role="group" aria-label="Predogled napisa ' + st.text + '"><defs>';
    cfg.paleta.forEach(function (c, k) {
      h += '<linearGradient id="g' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + U.mix(c.hex, .3, 255) + '"/><stop offset=".45" stop-color="' + c.hex + '"/><stop offset="1" stop-color="' + U.mix(c.hex, .24, 0) + '"/></linearGradient>';
    });
    h += '<filter id="sh" x="-20%" y="-30%" width="150%" height="180%"><feDropShadow dx="2" dy="5" stdDeviation="3.2" flood-color="#000" flood-opacity=".32"/></filter></defs><g filter="url(#sh)">';
    lay.items.forEach(function (it) {
      var c = cfg.paleta[st.cols[it.i]];
      h += '<text class="ltr" data-i="' + it.i + '" tabindex="0" role="button" aria-label="Črka ' + it.ch + ', barva ' + c.ime + '" x="' + (mL + it.x) + '" y="' + base + '" style="font:' + FONT + '" fill="url(#g' + st.cols[it.i] + ')" stroke="url(#g' + st.cols[it.i] + ')" stroke-width="7" stroke-linejoin="round" paint-order="stroke">' + it.ch + '</text>';
    });
    h += "</g>";

    var cur = lay.items.filter(function (it) { return it.i === st.sel; })[0];
    if (cur && !st.allMode) {
      var cx = mL + cur.x + cur.w / 2, ty = mT - 26 / s, t = 7 / s;
      h += '<path d="M' + (cx - t) + ' ' + ty + ' h' + (2 * t) + ' l' + (-t) + ' ' + (t * 1.2) + ' z" fill="' + lc + '" stroke="' + halo + '" stroke-width="' + (1.5 / s) + '"/>';
    }
    if (show) {
      var y = base + 18 / s, x0 = mL - 3.5, x1 = mL + lay.W + 3.5, tk = 5 / s, vx = mL - 20 / s, y0 = base - lay.cap;
      var lines = 'M' + x0 + ' ' + y + ' H' + x1 + ' M' + x0 + ' ' + (y - tk) + ' V' + (y + tk) + ' M' + x1 + ' ' + (y - tk) + ' V' + (y + tk) + ' M' + vx + ' ' + y0 + ' V' + base + ' M' + (vx - tk) + ' ' + y0 + ' H' + (vx + tk) + ' M' + (vx - tk) + ' ' + base + ' H' + (vx + tk);
      h += '<path d="' + lines + '" stroke="' + halo + '" stroke-width="' + (3.4 / s) + '" fill="none" stroke-linecap="round"/><path d="' + lines + '" stroke="' + lc + '" stroke-width="' + (1.3 / s) + '" fill="none" stroke-linecap="round"/>';
      var ts = 'font:700 ' + fs + 'px Figtree,system-ui,sans-serif;paint-order:stroke';
      h += '<text x="' + ((x0 + x1) / 2) + '" y="' + (y + 15 / s) + '" text-anchor="middle" style="' + ts + '" fill="' + lc + '" stroke="' + halo + '" stroke-width="' + (3 / s) + '">pribl. ' + U.num(Wcm) + ' cm</text>';
      h += '<text transform="translate(' + (vx - 7 / s) + ' ' + ((y0 + base) / 2) + ') rotate(-90)" text-anchor="middle" style="' + ts + '" fill="' + lc + '" stroke="' + halo + '" stroke-width="' + (3 / s) + '">' + U.num(V) + ' cm</text>';
    }
    wordEl.innerHTML = h + "</svg>";

    Array.prototype.forEach.call(wordEl.querySelectorAll("text.ltr"), function (t) {
      var pick = function () {
        if (moved) { moved = false; return; }
        onPick(+t.getAttribute("data-i"));
      };
      t.addEventListener("click", pick);
      t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
    });
    return { Wcm: Wcm, V: V };
  }

  /* vlečenje napisa po fotografiji */
  function initDrag() {
    wordEl.addEventListener("pointerdown", function (e) {
      if (!KS.scene.fotoMode()) { return; }
      drag = { x: e.clientX - st.offX, y: e.clientY - st.offY }; moved = false;
      try { wordEl.setPointerCapture(e.pointerId); } catch (err) { /* starejši brskalniki */ }
    });
    wordEl.addEventListener("pointermove", function (e) {
      if (!drag) { return; }
      var nx = e.clientX - drag.x, ny = e.clientY - drag.y;
      if (Math.abs(nx - st.offX) > 4 || Math.abs(ny - st.offY) > 4) { moved = true; }
      st.offX = nx; st.offY = ny;
      wordEl.style.transform = "translate(" + st.offX + "px," + st.offY + "px)";
    });
    wordEl.addEventListener("pointerup", function () { drag = null; });
    wordEl.addEventListener("pointercancel", function () { drag = null; });
  }

  KS.preview = {
    FONT: FONT,
    letters: letters,
    heightCm: heightCm,
    heightIsExample: heightIsExample,
    draw: draw,
    /* onPickLetter(i) pokliče configurator ob tapu na črko */
    init: function (onPickLetter) {
      stage = $("stage"); wordEl = $("word"); onPick = onPickLetter;
      initDrag();
    }
  };
})();
