/*
  Košček sreče – edini vir spremenljivih podatkov.

  Vsebina med oklepajema { ... } je strog JSON (dvojni narekovaji, brez
  komentarjev, brez zadnje vejice), da jo bo v drugi fazi lahko prebral tudi
  PHP: odreže ovoj "window.KS_CONFIG =" in ";" ter pokliče json_decode.

  Manjkajoče vrednosti so null. Stran jih sama označi kot "vpiše prodajalec".
*/
window.KS_CONFIG = {
  "znamka": {
    "ime": "Košček sreče",
    "slogan": "Majhne stvari. Veliki nasmehi.",
    "opis": "Napihnjene dekorativne črke za otroške sobe, vrata in pohištvo."
  },

  "prodajalec": {
    "naziv": "KAIAN storitveno podjetje d.o.o.",
    "naslov": "Volfova ulica 16, 1230 Domžale",
    "maticna": "5699142000",
    "davcna": "SI96264004",
    "zavezanecZaDdv": true,
    "email": "kosceksrece@gmail.com",
    "telefon": null,
    "instagram": "https://www.instagram.com/kosceksrece/",
    "facebook": null
  },

  "cenik": {
    "zDdv": true,
    "cene": { "1": 9.90, "2": 17.90, "3": 24.90, "4": 29.90, "5": 35.90, "6": 41.90, "7": 47.90, "8": 53.90 },
    "najvecCrk": 8,
    "opombaNadNajvec": "Več kot 8 črk po dogovoru, samo po predračunu."
  },

  "napis": {
    "najvecZnakov": 12,
    "dovoljeniZnaki": "A-ZČŠŽĆĐ0-9 "
  },

  "dostava": {
    "pragBrezplacne": 50,
    "cenaPodPragom": null,
    "osebniPrevzem": true
  },

  "izdelava": {
    "delovnihDniOd": 3,
    "delovnihDniDo": 6
  },

  "placila": {
    "zivo": false
  },

  "predracun": {
    "iban": null,
    "bic": null,
    "prejemnik": "KAIAN storitveno podjetje d.o.o.",
    "rokVeljavnostiDni": null
  },

  "mere": {
    "visinaCm": null,
    "sirinaOdCm": null,
    "sirinaDoCm": null,
    "debelinaCm": null,
    "razmikCm": null,
    "material": null,
    "pritrditev": "dvostranske lepilne blazinice, v paketu",
    "primerVisineCm": 7
  },

  "paleta": [
    { "ime": "Bež", "hex": "#E4DFC3" },
    { "ime": "Rumena", "hex": "#EDCB2E" },
    { "ime": "Oranžna", "hex": "#DC5F1C" },
    { "ime": "Rdeča", "hex": "#B02A28" },
    { "ime": "Pastelna roza", "hex": "#EC7CAE" },
    { "ime": "Roza", "hex": "#A8306E" },
    { "ime": "Pastelna modra", "hex": "#5C83AD" },
    { "ime": "Sinje modra", "hex": "#2C6FBF" },
    { "ime": "Globoko modra", "hex": "#1A2C6E" },
    { "ime": "Pastelna zelena", "hex": "#4F8454" },
    { "ime": "Travniška zelena", "hex": "#45A84A" },
    { "ime": "Rjava", "hex": "#4E2B1F" }
  ],

  "zacetneBarve": [10, 0, 6, 4, 2, 7, 9, 5, 1, 3, 8, 11],

  "stene": [
    { "ime": "Bela", "hex": "#F4F1EC" },
    { "ime": "Bež", "hex": "#E6D9C3" },
    { "ime": "Siva", "hex": "#C9CCD1" },
    { "ime": "Žajbelj", "hex": "#B9C7B0" },
    { "ime": "Pastelno modra", "hex": "#C7DAE8" },
    { "ime": "Pastelno roza", "hex": "#F1D5D8" },
    { "ime": "Gorčica", "hex": "#D9B45B" },
    { "ime": "Temno modra", "hex": "#2F3E5C" },
    { "ime": "Grafit", "hex": "#3B3D42" }
  ],

  "podlage": [
    { "id": "stena", "ime": "Stena", "barvaStene": true },
    { "id": "vrata", "ime": "Bela vrata", "barvaStene": true },
    { "id": "vrataLes", "ime": "Lesena vrata", "barvaStene": true },
    { "id": "omara", "ime": "Bela omara", "barvaStene": false },
    { "id": "predalnik", "ime": "Lesen predalnik", "barvaStene": true },
    { "id": "okvir", "ime": "Bel okvir", "barvaStene": false },
    { "id": "foto", "ime": "Moja fotografija", "barvaStene": false }
  ],

  "fotografija": {
    "razdaljaM": 2,
    "pokritoCmPokoncno": 200,
    "pokritoCmLezece": 280
  },

  "galerija": [
    { "slika": "img/nikola.jpg", "alt": "Napis NIKOLA v pastelnih barvah v belem okvirju", "podpis": "Nikola · v belem okvirju", "velika": true },
    { "slika": "img/leo.jpg", "alt": "Napis LEO z majhnimi figuricami na beli steni", "podpis": "Leo · s figuricami" },
    { "slika": "img/k.jpg", "alt": "Roza črka K s pletenim vzorcem na leseni polici", "podpis": "K · s pletenim vzorcem" },
    { "slika": "img/iva.jpg", "alt": "Roza črka I z imenom Iva na leseni polici", "podpis": "Iva · začetnica z imenom" }
  ]
};
