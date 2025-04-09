import React from "react";

export default function Header() {
  return (
    <div className="flex h-25 w-screen flex-row justify-between bg-blue-600">
      <div className="ml-26 flex w-2/5 flex-row items-center justify-start">
        <button className="mr-6 cursor-pointer rounded-sm p-1.5 font-semibold hover:bg-amber-300">
          КУПОВИНА
        </button>
        <button className="mr-6 cursor-pointer rounded-sm p-1.5 font-semibold hover:bg-amber-300">
          ИЗНАЈМЉИВАЊЕ
        </button>
        <button className="cursor-pointer rounded-sm p-1.5 font-semibold hover:bg-amber-300">
          ПРОДАЈА
        </button>
      </div>
      <div className="logo w-2/5"></div>
      <div className="mr-26 flex w-1/5 flex-row items-center justify-end">
        <button className="mr-6 cursor-pointer rounded-sm p-1.5 font-semibold hover:bg-amber-300">
          ПОМОЋ
        </button>
        <button className="cursor-pointer rounded-sm p-1.5 font-semibold hover:bg-amber-300">
          ПРИЈАВА
        </button>
      </div>
    </div>
  );
}
