/* Košček sreče – podlage v predogledu (stena, vrata, omara, predalnik, okvir, fotografija). */
(function () {
  "use strict";
  var KS = window.KS, st = KS.state, U = KS.util;

  function wood(x, y, w, h, base, dark) {
    var s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + base + '"/>';
    for (var i = 1; i < 9; i++) {
      var yy = y + h * i / 9 + ((i * 37) % 7) - 3;
      s += '<path d="M' + x + ' ' + yy + ' q' + w / 4 + ' ' + ((i % 2) ? 5 : -5) + ' ' + w / 2 + ' 0 t' + w / 2 + ' 0" stroke="' + dark + '" stroke-width="1" fill="none" opacity=".35"/>';
    }
    return s;
  }

  function fotoMode() { return st.scene === "foto" && !!st.photo.url; }

  function svg() {
    if (fotoMode()) { return '<img src="' + st.photo.url + '" alt="">'; }
    var scene = st.scene, wall = st.wall;
    var s = '<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    var floor = '<rect x="0" y="226" width="400" height="6" fill="#fff" opacity=".9"/><rect x="0" y="232" width="400" height="18" fill="#cdb594"/>';
    if (scene === "stena" || scene === "foto") {
      s += '<rect width="400" height="250" fill="' + wall + '"/>' + floor;
    } else if (scene === "vrata" || scene === "vrataLes") {
      var les = scene === "vrataLes", f = les ? "#b98a5a" : "#f8f6f1", stc = les ? "#8f6537" : "#d6d1c6";
      s += '<rect width="400" height="250" fill="' + wall + '"/>' + floor + '<rect x="52" y="-6" width="296" height="262" fill="' + (les ? "#9c7244" : "#ffffff") + '"/>';
      s += les ? wood(60, -6, 280, 262, f, "#7d5830") : '<rect x="60" y="-6" width="280" height="262" fill="' + f + '"/>';
      s += '<rect x="82" y="14" width="236" height="138" rx="3" fill="none" stroke="' + stc + '" stroke-width="2.5"/><rect x="82" y="168" width="236" height="100" rx="3" fill="none" stroke="' + stc + '" stroke-width="2.5"/>';
      s += '<rect x="322" y="150" width="7" height="26" rx="3.5" fill="#8d8f94"/><rect x="302" y="156" width="26" height="6" rx="3" fill="#a9abb0"/>';
    } else if (scene === "omara") {
      s += '<rect width="400" height="250" fill="#f3f0e9"/><rect x="14" y="10" width="318" height="250" fill="#faf8f3" stroke="#d9d4c9" stroke-width="2"/><rect x="338" y="10" width="80" height="250" fill="#faf8f3" stroke="#d9d4c9" stroke-width="2"/>';
      s += '<rect x="316" y="104" width="5" height="44" rx="2.5" fill="#b7b2a6"/><rect x="349" y="104" width="5" height="44" rx="2.5" fill="#b7b2a6"/><rect width="400" height="10" fill="#e4dfd4"/>';
    } else if (scene === "predalnik") {
      s += '<rect width="400" height="250" fill="' + wall + '"/><rect x="8" y="44" width="384" height="12" rx="2" fill="#a8794a"/>' + wood(16, 56, 368, 200, "#c49662", "#8a6235");
      s += '<rect x="26" y="66" width="348" height="112" rx="4" fill="none" stroke="#8a6235" stroke-width="2.5"/><rect x="26" y="190" width="348" height="80" rx="4" fill="none" stroke="#8a6235" stroke-width="2.5"/>';
      s += '<circle cx="48" cy="122" r="6" fill="#5b4024"/><circle cx="352" cy="122" r="6" fill="#5b4024"/><circle cx="48" cy="226" r="6" fill="#5b4024"/><circle cx="352" cy="226" r="6" fill="#5b4024"/>';
    } else {
      s += '<rect width="400" height="250" fill="#e6dccb"/><path d="M0 60 q100 14 200 0 t200 0 M0 170 q100 -12 200 0 t200 0" stroke="#d6cab5" stroke-width="2" fill="none"/>';
      s += '<rect x="30" y="34" width="344" height="190" fill="#000" opacity=".12"/><rect x="24" y="26" width="344" height="190" fill="#f5f6f8" stroke="#ffffff" stroke-width="12"/><rect x="30" y="32" width="332" height="178" fill="none" stroke="#dfe1e6" stroke-width="1.5"/>';
    }
    return s + "</svg>";
  }

  /* temna podlaga -> svetle kote in oznake */
  function darkBg() {
    if (fotoMode()) { return st.photo.dark; }
    return (st.scene === "stena" || st.scene === "foto") && U.lum(st.wall) < 110;
  }

  KS.scene = { svg: svg, darkBg: darkBg, fotoMode: fotoMode };
})();
