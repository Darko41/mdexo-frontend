import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  return (
    <div className="flex h-12 w-70 flex-row items-center justify-center rounded-xl border-2 border-blue-800 bg-white">
      <FaSearch id="pretraga-lokacija" className="ml-3" />
      <input
        className="ml-2 rounded-xl pl-2 text-left outline-none"
        type="text"
        placeholder="Куцајте за претрагу"
      />
    </div>
  );
}
