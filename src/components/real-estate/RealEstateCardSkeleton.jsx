export default function RealEstateCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-full flex flex-col">
      {/* Image placeholder */}
      <div className="bg-gray-200 h-48 w-full relative">
        {/* Top badges placeholder */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2">
          <div className="h-6 bg-gray-300 rounded-full w-20"></div>
          <div className="h-6 bg-gray-300 rounded-full w-16"></div>
        </div>
        
        {/* Price overlay placeholder */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
          <div className="h-6 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        {/* Title placeholder */}
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
        
        {/* 🆕 NEW: Property details row placeholder */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded w-14"></div>
        </div>
        
        {/* 🆕 NEW: Additional property details placeholder */}
        <div className="flex flex-wrap gap-1 mb-3">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Location placeholder */}
        <div className="flex items-center mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded mr-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Size placeholder */}
        <div className="flex items-center mb-3">
          <div className="h-4 w-4 bg-gray-200 rounded mr-1"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
        
        {/* Features placeholder */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-14"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-10"></div>
        </div>
        
        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>
        
        {/* Button placeholder */}
        <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}