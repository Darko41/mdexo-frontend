import SearchBar from "./SearchBar";

export default function Main() {
  return (
    <section className="flex flex-col items-center justify-center bg-cover bg-center h-screen text-white" style={{ backgroundImage: "url('/bgImage.jpg')" }}>
      <div className="flex flex-col items-center">
        <p className="bg-opacity-60 bg-black px-6 py-4 text-4xl font-bold text-center mb-8 rounded-lg sm:text-3xl md:text-4xl">
          ПРОНАЂИТЕ ВАШ ДОМ ИЗ СНОВА
        </p>
        <SearchBar />
      </div>
    </section>
  );
}
