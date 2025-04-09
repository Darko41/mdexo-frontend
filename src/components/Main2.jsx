import KomponentaZaIzbor from "./KomponentaZaIzbor";

import React from "react";

export default function Main2() {
  return (
    <div className="flex flex-row items-center justify-around bg-amber-50 pt-15 pb-15">
      <KomponentaZaIzbor
        slika=""
        naslov="Kupi dom"
        tekst="Neki tekst"
        tekstDugmeta="Pronadji agenta"
      />
      <KomponentaZaIzbor
        slika=""
        naslov="Iznajmi dom"
        tekst="Neki tekst"
        tekstDugmeta="Pronadji nekretninu"
      />
      <KomponentaZaIzbor
        slika=""
        naslov="Prodaj dom"
        tekst="Neki tekst"
        tekstDugmeta="Pogledaj opcije"
      />
    </div>
  );
}
