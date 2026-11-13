/* Košček sreče – naročilo in plačilo.
   Če je v config.js placila.zivo = true, obrazec pošlje naročilo na api/narocilo.php:
   kartica -> preusmeritev na Stripe Checkout, predračun -> podatki za nakazilo.
   Status "plačano" nastavi samo strežnik po Stripe webhooku; stran ga le prebere (api/stanje.php).
   Če je placila.zivo = false, plačilo ostane simulirano kot v prototipu (stran brez PHP). */
(function () {
  "use strict";
  var KS = window.KS, st = KS.state, U = KS.util, cfg = KS.cfg, $ = U.$, C = KS.configurator;
  var STEPS = ["form", "cardStep", "failStep", "paidStep", "proStep", "waitStep"];
  var ZIVO = !!(cfg.placila && cfg.placila.zivo);
  var API = "api/";

  function show(id) {
    STEPS.forEach(function (s) { if ($(s)) { $(s).hidden = (s !== id); } });
    $("blagajna").scrollIntoView({ block: "start" });
    var h = $(id).querySelector("h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }
  function newNo() {
    var d = new Date();
    return "KS-" + String(d.getFullYear()).slice(2) + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + "-" + (100 + Math.floor(Math.random() * 900));
  }
  function payMode() { return $("p-kartica").checked ? "kartica" : "predracun"; }
  function email() { return $("email").value.trim(); }
  function setBusy(b) { $("submit").disabled = b; $("submit").textContent = b ? "Trenutek …" : submitLabel(); }
  function submitLabel() { return payMode() === "kartica" ? "Nadaljuj na plačilo s kartico" : "Oddaj naročilo in prejmi predračun"; }
  function showErr(m) { var err = $("err"); err.textContent = m; err.hidden = false; err.focus(); }

  function validate() {
    var p = C.price();
    if (!C.letters().length) { return "Najprej sestavi napis."; }
    if (!$("ime").value.trim()) { return "Vpiši ime in priimek."; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email())) { return "Vpiši veljaven e-naslov, na primer ime@primer.si."; }
    if ($("d-posta").checked && !$("naslov").value.trim()) { return "Vpiši naslov za dostavo ali izberi osebni prevzem."; }
    if (!$("soglasje").checked) { return "Za oddajo potrdi strinjanje s pogoji."; }
    if (!p && payMode() === "kartica") { return "Za več kot " + cfg.cenik.najvecCrk + " črk ceno potrdimo ročno, zato izberi plačilo po predračunu."; }
    return "";
  }

  /* podatki za strežnik: napis, indeksi barv po znakih, kupec */
  function payload() {
    return {
      napis: st.text,
      barve: st.cols.slice(0, st.text.length),
      ime: $("ime").value.trim(),
      email: email(),
      telefon: $("tel").value.trim(),
      dostava: $("d-posta").checked ? "posta" : "osebno",
      naslov: $("naslov").value.trim(),
      rok: $("rok").value,
      opomba: $("opomba").value.trim(),
      placilo: payMode(),
      soglasje: $("soglasje").checked
    };
  }

  function showProforma(d) {
    var todo = function (v) { return v || U.todo("vpiše prodajalec"); };
    $("mailPro").textContent = d.email; $("noPro").textContent = d.stevilka;
    U.dl($("proSum"), [
      ["Napis", d.napis], ["Barve", d.barve], ["Znesek", d.znesek],
      ["Prejemnik", todo(d.prejemnik)], ["Račun (IBAN)", todo(d.iban)], ["Sklic", d.sklic],
      ["Rok plačila", d.rok || U.todo("vpiše prodajalec")]
    ]);
    show("proStep");
  }

  /* ---- živo: strežnik ---- */
  function submitLive() {
    setBusy(true);
    fetch(API + "narocilo.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, napaka: "Strežnik ni odgovoril pravilno." }; }); })
      .then(function (d) {
        if (!d.ok) { setBusy(false); showErr(d.napaka || "Naročila ni bilo mogoče oddati."); return; }
        st.orderNo = d.stevilka;
        if (d.url) { window.location.href = d.url; return; }   // Stripe Checkout
        setBusy(false);
        var p = d.predracun; p.stevilka = d.stevilka;
        showProforma(p);
      })
      .catch(function () { setBusy(false); showErr("Povezava s strežnikom ni uspela. Preveri internet in poskusi znova."); });
  }

  /* vrnitev s Stripe: ?placilo=uspeh&n=...&t=... ali ?placilo=preklic */
  function handleReturn() {
    var q = new URLSearchParams(window.location.search);
    var placilo = q.get("placilo");
    if (!placilo) { return; }
    // po vrnitvi s Stripe-a pokaži blagajno, ne vrha strani
    setTimeout(function () { var b = $("blagajna"); if (b) { b.scrollIntoView(); } }, 0);
    var n = q.get("n") || "", t = q.get("t") || "";
    st.orderNo = n;
    if (placilo === "preklic") { show("failStep"); return; }
    if (placilo !== "uspeh" || !n || !t) { return; }
    $("noWait").textContent = n;
    show("waitStep");
    var poskus = 0;
    (function preveri() {
      fetch(API + "stanje.php?n=" + encodeURIComponent(n) + "&t=" + encodeURIComponent(t))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.ok && (d.status === "placano" || d.status === "odposlano")) { $("noPaid").textContent = d.stevilka; $("mailPaid").textContent = d.email; show("paidStep"); return; }
          if (++poskus < 8) { setTimeout(preveri, 2000); }
          else { $("waitNote").hidden = false; }
        })
        .catch(function () { if (++poskus < 8) { setTimeout(preveri, 3000); } else { $("waitNote").hidden = false; } });
    })();
    try { history.replaceState(null, "", window.location.pathname + "#blagajna"); } catch (e) { /* ni pomembno */ }
  }

  /* ---- simulacija (brez strežnika) ---- */
  function submitSim() {
    st.orderNo = newNo();
    if (payMode() === "kartica") {
      U.dl($("cardSum"), [["Naročilo", st.orderNo], ["Napis", st.text], ["Barve", C.colourLine()], ["Za plačilo", C.totalText(C.price())]]);
      show("cardStep");
    } else { proformaSim(); }
  }
  function proformaSim() {
    var p = C.price(), pr = cfg.predracun;
    if (!st.orderNo) { st.orderNo = newNo(); }
    showProforma({
      email: email(), stevilka: st.orderNo, napis: st.text, barve: C.colourLine(), znesek: C.totalText(p),
      prejemnik: pr.prejemnik, iban: pr.iban, sklic: "SI00 " + st.orderNo.replace(/\D/g, ""),
      rok: pr.rokVeljavnostiDni != null ? pr.rokVeljavnostiDni + " dni" : null
    });
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll("input[name=dostava]"), function (r) {
      r.addEventListener("change", function () { $("naslovBox").hidden = !$("d-posta").checked; });
    });
    Array.prototype.forEach.call(document.querySelectorAll("input[name=placilo]"), function (r) {
      r.addEventListener("change", function () {
        Array.prototype.forEach.call(document.querySelectorAll(".pay"), function (l) { l.classList.toggle("on", l.querySelector("input").checked); });
        $("submit").textContent = submitLabel();
      });
    });
    if ($("simNote")) { $("simNote").hidden = ZIVO; }
    if ($("simButtons")) { $("simButtons").hidden = ZIVO; }

    $("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var m = validate();
      if (m) { showErr(m); return; }
      $("err").hidden = true;
      if (ZIVO) { submitLive(); } else { submitSim(); }
    });
    $("payOk").addEventListener("click", function () { $("noPaid").textContent = st.orderNo; $("mailPaid").textContent = email(); show("paidStep"); });
    $("payFail").addEventListener("click", function () { show("failStep"); });
    $("retry").addEventListener("click", function () { if (ZIVO) { show("form"); } else { show("cardStep"); } });
    $("toProforma").addEventListener("click", function () {
      $("p-predracun").checked = true; $("p-predracun").dispatchEvent(new Event("change"));
      if (ZIVO) { show("form"); $("submit").focus(); } else { proformaSim(); }
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-back]"), function (b) { b.addEventListener("click", function () { show("form"); }); });

    if (ZIVO) { handleReturn(); }
  }

  KS.checkout = { init: init };
})();
