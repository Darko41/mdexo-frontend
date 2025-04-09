import React from "react";

export default function KomponentaZaIzbor({
  slika,
  naslov,
  tekst,
  tekstDugmeta,
}) {
  return (
    <div className="flex w-100 flex-col items-center justify-around rounded-xl bg-blue-100">
      <img className="mt-4" src={slika} alt="slika" />
      <h2 className="mt-4 mb-4 text-2xl font-bold">{naslov}</h2>
      <p className="text-black">{tekst}</p>
      <button className="mt-4 mb-4 cursor-pointer rounded-xl border-2 border-blue-800 p-2 text-blue-800 hover:bg-amber-300">
        {tekstDugmeta}
      </button>
    </div>
  );
}
