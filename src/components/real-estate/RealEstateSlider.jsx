import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import API from '../../utils/api/api.js';

export default function RealEstateSlider() {
	const [realEstates, setRealEstates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const sliderRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startPos, setStartPos] = useState(0);
	const [currentTranslate, setCurrentTranslate] = useState(0);
	const [prevTranslate, setPrevTranslate] = useState(0);

	// Fetch data when the component mounts
	useEffect(() => {
		const fetchRealEstates = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await API.realEstates.search(); // no params here
				setRealEstates(response.data.content || []);
			} catch (error) {
				setError("Failed to fetch real estate data.");
				console.error("Error fetching real estate data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchRealEstates();
	}, []);

	// Touch and mouse event handlers for swipe functionality
	useEffect(() => {
		if (!sliderRef.current || realEstates.length === 0) return;

		const slider = sliderRef.current;

		const getPositionX = (e) => {
			return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
		};

		const handleStart = (e) => {
			setIsDragging(true);
			setStartPos(getPositionX(e));
			setPrevTranslate(currentTranslate);
			slider.style.cursor = 'grabbing';
			slider.style.transition = 'none';
		};

		const handleMove = (e) => {
			if (!isDragging) return;
			const currentPosition = getPositionX(e);
			const diff = currentPosition - startPos;
			setCurrentTranslate(prevTranslate + diff);
		};

		const handleEnd = () => {
			setIsDragging(false);
			const movedBy = currentTranslate - prevTranslate;

			// If moved significantly to left, go to next
			if (movedBy < -50 && currentIndex < realEstates.length - 5) {
				goToNext();
			}
			// If moved significantly to right, go to previous
			else if (movedBy > 50 && currentIndex > 0) {
				goToPrev();
			}

			// Reset translate
			setCurrentTranslate(0);
			slider.style.cursor = 'grab';
			slider.style.transition = 'transform 0.3s ease-out';
		};

		// Add event listeners for touch
		slider.addEventListener('touchstart', handleStart);
		slider.addEventListener('touchmove', handleMove);
		slider.addEventListener('touchend', handleEnd);

		// Add event listeners for mouse
		slider.addEventListener('mousedown', handleStart);
		slider.addEventListener('mousemove', handleMove);
		slider.addEventListener('mouseup', handleEnd);
		slider.addEventListener('mouseleave', handleEnd);

		return () => {
			// Clean up touch listeners
			slider.removeEventListener('touchstart', handleStart);
			slider.removeEventListener('touchmove', handleMove);
			slider.removeEventListener('touchend', handleEnd);

			// Clean up mouse listeners
			slider.removeEventListener('mousedown', handleStart);
			slider.removeEventListener('mousemove', handleMove);
			slider.removeEventListener('mouseup', handleEnd);
			slider.removeEventListener('mouseleave', handleEnd);
		};
	}, [currentIndex, isDragging, prevTranslate, realEstates.length, startPos]);

	const goToNext = () => {
		if (currentIndex < realEstates.length - 5) {
			setCurrentIndex(prev => prev + 1);
		}
	};

	const goToPrev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(prev => prev - 1);
		}
	};

	if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
	if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

	return (
		<section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Featured Properties</h2>

				<div className="relative">
					<div
						ref={sliderRef}
						className="flex gap-6 overflow-hidden cursor-grab"
						style={{
							transform: `translateX(${-currentIndex * 25}%)`,
							transition: isDragging ? 'none' : 'transform 0.3s ease-out'
						}}
					>
						{realEstates.map((estate) => (
							<div
								key={estate.id}
								className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 transition-transform duration-300 hover:scale-105"
							>
								<div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
									<div className="relative h-48 overflow-hidden">
										<img
											src={estate.imageUrl || 'https://via.placeholder.com/300'}
											alt={estate.title}
											className="w-full h-full object-cover"
											loading="lazy"
										/>
										<div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold shadow">
											{estate.type || 'For Sale'}
										</div>
										<div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
											<span className="text-white font-semibold">${estate.price.toLocaleString()}</span>
										</div>
									</div>
									<div className="p-4 flex-grow">
										<h3 className="text-lg font-semibold text-gray-900 mb-1">{estate.title}</h3>
										<p className="text-gray-600 text-sm mb-2">{estate.city}, {estate.state}</p>
										<p className="text-gray-700 text-sm mb-3 line-clamp-2">{estate.description}</p>
										<div className="flex justify-between text-sm text-gray-500 mt-auto">
											<span>{estate.bedrooms || 'N/A'} beds</span>
											<span>{estate.bathrooms || 'N/A'} baths</span>
											<span>{estate.sqft || 'N/A'} sqft</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{currentIndex > 0 && (
						<button
							onClick={goToPrev}
							className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
							aria-label="Previous properties"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
					)}

					{currentIndex < realEstates.length - 5 && (
						<button
							onClick={goToNext}
							className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 focus:outline-none"
							aria-label="Next properties"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					)}
				</div>

				<div className="text-center mt-8">
					<Link to="/real-estates">
						<button className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-lg hover:shadow-xl font-medium">
							View All Properties
						</button>
					</Link>
				</div>
			</div>
		</section>
	);
}