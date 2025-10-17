import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api/api.js';

const PropertyType = {
	HOUSE: 'HOUSE',
	APARTMENT: 'APARTMENT',
	CONDO: 'CONDO',
	LAND: 'LAND',
	GARRAGE: 'GARRAGE',
	COMMERCIAL: 'COMMERCIAL',
	OTHER: 'OTHER'
};

const ListingType = {
	FOR_SALE: 'FOR_SALE',
	FOR_RENT: 'FOR_RENT',
	FOR_LEASE: 'FOR_LEASE'
};

export default function CreateListingForm() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		propertyType: PropertyType.HOUSE,
		listingType: ListingType.FOR_SALE,
		price: '',
		address: '',
		city: '',
		state: '',
		zipCode: '',
		sizeInSqMt: '',
		features: [],
		images: []
	});
	const [newFeature, setNewFeature] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleFileChange = (e) => {
	  const files = Array.from(e.target.files);
	  console.log('📸 Files selected:', files.length, files);
	  
	  setFormData(prev => ({
	    ...prev,
	    images: files
	  }));
	};

	const handleDragOver = (e) => {
	  e.preventDefault();
	  setIsDragOver(true);
	};

	const handleDragLeave = (e) => {
	  e.preventDefault();
	  setIsDragOver(false);
	};

	const handleDrop = (e) => {
	  e.preventDefault();
	  setIsDragOver(false);
	  
	  const files = Array.from(e.dataTransfer.files).filter(file => 
	    file.type.startsWith('image/')
	  );
	  
	  if (files.length > 0) {
	    setFormData(prev => ({
	      ...prev,
	      images: [...prev.images, ...files] // Append to existing images
	    }));
	  }
	};

	const handleAddFeature = () => {
		if (newFeature && formData.features.length < 10) {
			setFormData(prev => ({
				...prev,
				features: [...prev.features, newFeature]
			}));
			setNewFeature('');
		}
	};

	const handleRemoveFeature = (index) => {
		setFormData(prev => ({
			...prev,
			features: prev.features.filter((_, i) => i !== index)
		}));
	};

	const handleRemoveImage = (index) => {
		setFormData(prev => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = async (e) => {
	  e.preventDefault();
	  setIsSubmitting(true);
	  setError(null);
	
	  try {
	    // Create FormData for multipart request
	    const formDataToSend = new FormData();
	    
	    // Prepare the listing data
	    const listingData = {
	      title: formData.title,
	      description: formData.description,
	      propertyType: formData.propertyType,
	      listingType: formData.listingType,
	      price: parseFloat(formData.price),
	      address: formData.address,
	      city: formData.city,
	      state: formData.state,
	      zipCode: formData.zipCode,
	      sizeInSqMt: formData.sizeInSqMt,
	      features: formData.features || [],
	      ownerId: null,
	    };
	    
	    console.log('📦 Listing data being sent:', listingData);
	    
	    // Add the listing data as JSON blob
	    formDataToSend.append('createDto', new Blob([JSON.stringify(listingData)], {
	      type: 'application/json'
	    }));
	    
	    // Add images if any
	    if (formData.images && formData.images.length > 0) {
	      formData.images.forEach(file => {
	        formDataToSend.append('images', file);
	      });
	    }
	
	    console.log('📦 Sending multipart form data with', formData.images?.length || 0, 'images');
	    
	    // Use the unified endpoint
	    const response = await API.realEstates.createWithFormData(formDataToSend);
	    
	    // ✅ CRITICAL: Check if response is HTML (redirect happened)
	    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
	      console.error('❌ Received HTML instead of JSON - authentication failed');
	      throw new Error('Authentication failed. Please log in again.');
	    }
	    
	    const data = response.data;
	    console.log('✅ Listing created successfully:', data);
	    
	    // ✅ Validate propertyId exists
	    if (!data.propertyId) {
	      console.error('❌ No propertyId in response:', data);
	      throw new Error('Property creation failed - no ID returned from server');
	    }
	    
	    console.log('🔗 Navigating to property:', data.propertyId);
	    navigate(`/property/${data.propertyId}`);
	  } catch (err) {
		  console.error('Error creating listing:', err);
		  
		  // ✅ Handle different error types
		  if (err.message.includes('Authentication failed')) {
		    setError('Your session has expired. Please log in again.');
		    // Force logout and redirect to home page
		    localStorage.removeItem('jwtToken');
		    localStorage.removeItem('user');
		    setTimeout(() => {
		      window.location.href = '/'; // Redirect to home
		    }, 2000);
		  } else if (err.message.includes('no ID returned')) {
		    setError('Property creation failed. The server did not return a valid property ID. Please try again.');
		  } else if (err.response?.status === 302) {
		    setError('Authentication required. Redirecting...');
		    localStorage.removeItem('jwtToken');
		    localStorage.removeItem('user');
		    setTimeout(() => {
		      window.location.href = '/'; // Redirect to home
		    }, 1000);
		  } else {
		    // Original error handling
		    if (err.response?.data) {
		      console.error('Backend error details:', err.response.data);
		    }
		    setError(err.response?.data?.message || err.message || 'Failed to create listing');
		  }
		} finally {
	    setIsSubmitting(false);
	  }
	};

	// Helper function to format enum values for display
	const formatEnumDisplay = (value) => {
		return value.toLowerCase().replace(/_/g, ' ');
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<h2 className="text-3xl font-bold text-gray-900 mb-8">Create a New Listing</h2>

			<form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
				{error && (
					<div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
						{error}
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<div>
							<label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
								Title*
							</label>
							<input
								type="text"
								id="title"
								name="title"
								value={formData.title}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
								Description
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={4}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
								Property Type*
							</label>
							<select
								id="propertyType"
								name="propertyType"
								value={formData.propertyType}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							>
								{Object.values(PropertyType).map(type => (
									<option key={type} value={type}>
										{formatEnumDisplay(type)}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="listingType" className="block text-sm font-medium text-gray-700 mb-1">
								Listing Type*
							</label>
							<select
								id="listingType"
								name="listingType"
								value={formData.listingType}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							>
								{Object.values(ListingType).map(type => (
									<option key={type} value={type}>
										{formatEnumDisplay(type)}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
								Price*
							</label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
								<input
									type="number"
									id="price"
									name="price"
									value={formData.price}
									onChange={handleChange}
									min="0"
									step="0.01"
									required
									className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>

					{/* Location Information */}
					<div className="space-y-4">
						<div>
							<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
								Address*
							</label>
							<input
								type="text"
								id="address"
								name="address"
								value={formData.address}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
									City*
								</label>
								<input
									type="text"
									id="city"
									name="city"
									value={formData.city}
									onChange={handleChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
									State*
								</label>
								<input
									type="text"
									id="state"
									name="state"
									value={formData.state}
									onChange={handleChange}
									required
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>

						<div>
							<label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
								ZIP Code*
							</label>
							<input
								type="text"
								id="zipCode"
								name="zipCode"
								value={formData.zipCode}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="sizeInSqMt" className="block text-sm font-medium text-gray-700 mb-1">
								Size (sq. meters)
							</label>
							<input
								type="text"
								id="sizeInSqMt"
								name="sizeInSqMt"
								value={formData.sizeInSqMt}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* Features */}
				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Features (max 10)
					</label>
					<div className="flex gap-2 mb-2">
						<input
							type="text"
							value={newFeature}
							onChange={(e) => setNewFeature(e.target.value)}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							placeholder="Add a feature (e.g. Swimming pool)"
						/>
						<button
							type="button"
							onClick={handleAddFeature}
							disabled={!newFeature || formData.features.length >= 10}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
						>
							Add
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{formData.features.map((feature, index) => (
							<div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
								<span className="text-sm">{feature}</span>
								<button
									type="button"
									onClick={() => handleRemoveFeature(index)}
									className="ml-2 text-gray-500 hover:text-red-500"
								>
									×
								</button>
							</div>
						))}
					</div>
				</div>

				{/* Image Upload */}
				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Images
					</label>
					
					{/* Hidden file input */}
					<input
						type="file"
						id="images"
						name="images"
						onChange={handleFileChange}
						multiple
						accept="image/*"
						className="hidden"
					/>
					
					{/* Drag and drop area */}
					<div 
						className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
							isDragOver 
								? 'border-blue-500 bg-blue-50' 
								: 'border-gray-300 hover:border-gray-400'
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => document.getElementById('images').click()}
					>
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
							aria-hidden="true"
						>
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span className="mt-2 block text-sm font-medium text-gray-700">
							{formData.images.length > 0
								? `${formData.images.length} file(s) selected`
								: 'Click to upload images or drag and drop'}
						</span>
						<span className="mt-1 text-xs text-gray-500">
							PNG, JPG, GIF up to 10MB
						</span>
						{isDragOver && (
							<div className="mt-2 text-blue-500 text-sm">
								Drop images here...
							</div>
						)}
					</div>
					
					{/* Image previews */}
					{formData.images.length > 0 && (
						<div className="mt-4">
							<p className="text-sm text-gray-600 mb-2">
								{formData.images.length} image(s) selected
							</p>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
								{formData.images.map((file, index) => (
									<div key={index} className="relative group">
										<img
											src={URL.createObjectURL(file)}
											alt={`Preview ${index + 1}`}
											className="w-full h-24 object-cover rounded-lg"
										/>
										<button
											type="button"
											onClick={() => handleRemoveImage(index)}
											className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
										>
											×
										</button>
										<div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
											{file.name}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="mt-8 flex justify-end">
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md hover:shadow-lg disabled:opacity-70"
					>
						{isSubmitting ? 'Creating Listing...' : 'Create Listing'}
					</button>
				</div>
			</form>
		</div>
	);
}