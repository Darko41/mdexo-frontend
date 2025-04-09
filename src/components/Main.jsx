import React from "react";
import SearchBar from "./SearchBar";

export default function Main() {
  return (
    <section className="flex h-72 w-full flex-col items-center justify-center bg-[url('/public/bgImage.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="flex w-200 flex-col items-center justify-center">
        <p className="bg mb-6 pt-12 text-center text-5xl font-bold text-wrap text-black">
          ПРОНАЂИТЕ ВАШ ДОМ ИЗ СНОВА
        </p>
        <SearchBar></SearchBar>
      </div>
    </section>
  );
}
