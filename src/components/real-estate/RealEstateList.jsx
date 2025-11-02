import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RealEstateCard, RealEstateCardSkeleton } from "../../components/real-estate";
import API from '../../utils/api/api.js';
import { AuthContext } from '../../context/AuthContext';

export default function RealEstateList() {
	const [realEstates, setRealEstates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	
	const { isAuthenticated, loading: authLoading, user, token } = useContext(AuthContext);
	const navigate = useNavigate();

	// Consolidated data fetching
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Fetch real estates and user profile in parallel if authenticated
				const [realEstatesResponse, profileResponse] = await Promise.all([
					API.realEstates.search(),
					isAuthenticated && user?.id ? loadUserProfile() : Promise.resolve(null)
				]);
				
				setRealEstates(realEstatesResponse.data.content || []);
			} catch (error) {
				setError("Failed to fetch real estate data.");
				console.error("Error fetching data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isAuthenticated, user?.id]); // Added dependencies

	const loadUserProfile = async () => {
		if (!user?.id || !token) return;
		
		try {
			const response = await API.users.getProfile(user.id);
			setUserProfile(response.data);
		} catch (error) {
			console.error('Error loading user profile:', error);
		}
	};

	const handleCreateListingClick = () => {
		if (!isAuthenticated) {
			navigate('/login', { 
				state: { 
					from: '/create-listing',
					message: 'Please log in to create a property listing'
				}
			});
			return;
		}

		// Simplified profile check
		const hasCompleteProfile = userProfile?.firstName && userProfile?.lastName && userProfile?.phone;

		if (!hasCompleteProfile) {
			navigate('/profile', { 
				state: { 
					from: '/create-listing',
					message: 'Please complete your profile before creating a listing',
					requireProfile: true
				}
			});
		} else {
			navigate('/create-listing');
		}
	};

	const handleRetry = () => {
		window.location.reload();
	};

	// Enhanced user greeting with profile data
	const getUserGreeting = () => {
		if (!isAuthenticated || !user) return null;

		const userName = userProfile?.firstName || user.email?.split('@')[0] || 'there';
		const hasIncompleteProfile = !userProfile?.firstName;
		
		return (
			<div className="text-center mb-6">
				<div className="inline-flex items-center gap-4 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
							{userProfile?.firstName ? userProfile.firstName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
						</div>
						<div className="text-left">
							<p className="text-gray-600">Welcome back, <span className="font-semibold text-gray-800">{userName}</span>!</p>
							{hasIncompleteProfile && (
								<p className="text-sm text-amber-600">
									⭐ Complete your profile to get started
								</p>
							)}
						</div>
					</div>
					{hasIncompleteProfile && (
						<Link 
							to="/profile" 
							className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
						>
							Complete Profile
						</Link>
					)}
				</div>
			</div>
		);
	};

	// Enhanced CTA text based on profile completion
	const getCTAText = () => {
		if (!isAuthenticated) {
			return {
				title: 'Want to list your property with us?',
				description: 'Join thousands of satisfied property owners who have successfully marketed their properties through our platform. Get more visibility, serious inquiries, and faster transactions.',
				buttonText: 'Create Your Listing Now',
				secondaryButtonText: 'Learn How It Works'
			};
		}

		if (!userProfile?.firstName) {
			return {
				title: 'Complete your profile to start listing properties',
				description: 'Finish setting up your profile to unlock the ability to create property listings and reach thousands of potential buyers and renters.',
				buttonText: 'Complete Profile to List',
				secondaryButtonText: 'Complete Profile'
			};
		}

		return {
			title: 'Ready to list your property?',
			description: 'Create your listing now and reach thousands of potential buyers and renters.',
			buttonText: 'Create Listing Now',
			secondaryButtonText: 'Learn How It Works'
		};
	};

	// Loading state component
	const LoadingState = () => (
		<div className="text-center py-12">
			<div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
			<p className="mt-2">Loading properties...</p>
		</div>
	);

	// Error state component
	const ErrorState = () => (
		<div className="text-center py-12">
			<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
				<div className="text-red-600 mb-4">
					<svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Properties</h3>
				<p className="text-red-600 mb-4">{error}</p>
				<button 
					onClick={handleRetry} 
					className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300"
				>
					Try Again
				</button>
			</div>
		</div>
	);

	// Empty state component
	const EmptyState = () => (
		<div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
			<div className="text-gray-500 mb-4">
				<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
				</svg>
			</div>
			<p className="text-lg text-gray-600 mb-4">No properties available at the moment.</p>
			<p className="text-gray-500">Check back later for new listings.</p>
		</div>
	);

	// Stats component
	const StatsSection = () => (
		<div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
			{[
				{ value: '15,000+', label: 'Monthly Visitors' },
				{ value: '95%', label: 'Satisfaction Rate' },
				{ value: '28 Days', label: 'Average Listing Time' },
				{ value: '24/7', label: 'Support Available' }
			].map((stat, index) => (
				<div key={index} className="bg-white p-3 rounded-lg shadow-sm">
					<div className="font-bold text-blue-600">{stat.value}</div>
					<div>{stat.label}</div>
				</div>
			))}
		</div>
	);

	// Show loading while checking auth or fetching data
	if (authLoading || loading) {
		return <LoadingState />;
	}

	if (error) {
		return <ErrorState />;
	}

	const ctaText = getCTAText();
	const hasIncompleteProfile = isAuthenticated && !userProfile?.firstName;

	return (
		<section className="w-full py-8 px-4 max-w-7xl mx-auto">
			{getUserGreeting()}
			
			<h2 className="text-3xl font-bold text-center mb-6">All Real Estates</h2>

			{/* Real Estate Grid Layout */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
				{realEstates.length === 0 ? (
					<EmptyState />
				) : (
					realEstates.map((estate) => (
						<RealEstateCard
							key={estate.id}
							property={estate}
						/>
					))
				)}
			</div>
			
			{/* Enhanced Advertisement CTA Section */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 md:p-12 text-center mb-12">
				<div className="max-w-3xl mx-auto">
					<h3 className="text-2xl md:text-3xl font-bold mb-4">
						{ctaText.title}
					</h3>
					<p className="text-lg mb-6">
						{ctaText.description}
					</p>
					
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<button
							onClick={handleCreateListingClick}
							className={`font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
								!isAuthenticated || hasIncompleteProfile 
									? 'bg-blue-600 hover:bg-blue-700 text-white' 
									: 'bg-green-600 hover:bg-green-700 text-white'
							}`}
							disabled={authLoading}
						>
							{authLoading ? 'Loading...' : ctaText.buttonText}
						</button>
						
						<Link to={hasIncompleteProfile ? "/profile" : "/how-it-works"}>
							<button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 border border-gray-300 rounded-lg transition-colors">
								{ctaText.secondaryButtonText}
							</button>
						</Link>
					</div>
					
					<StatsSection />
				</div>
			</div>

			{/* For Existing Users - Only show if not authenticated */}
			{!isAuthenticated && !authLoading && (
				<div className="text-center">
					<p className="mb-4 text-gray-600">Already have an account?</p>
					<div className="flex justify-center gap-4">
						<Link to="/login">
							<button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
								Sign In
							</button>
						</Link>
						<Link to="/signup">
							<button className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300">
								Register
							</button>
						</Link>
					</div>
				</div>
			)}
		</section>
	);
}