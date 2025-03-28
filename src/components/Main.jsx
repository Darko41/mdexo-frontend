import RealEstateSlider from "./RealEstateSlider";
import SearchBar from "./SearchBar";  // Ensure SearchBar is imported

export default function Main() {
  return (
    <>
      <section className="relative w-full h-[20vh] bg-[url('/bgImage.jpg')] bg-cover bg-no-repeat bg-center">
        <div className="absolute top-0 left-0 w-full h-[20vh] bg-black opacity-30"></div> {/* Optional dark overlay */}
        
        <div className="flex flex-col items-center justify-center h-full z-10 relative">
          <div className="flex flex-col items-center justify-center w-full px-4 pt-8">
            <p className="bg mb-3 text-4xl font-bold text-white text-center">
              ПРОНАЂИТЕ ВАШ ДОМ ИЗ СНОВА
            </p>
            {/* Search Bar */}
            <SearchBar />
          </div>
        </div>
      </section>
      
      {/* Real Estate Slider Below the Background Image */}
      <RealEstateSlider />
    </>
  );
}
