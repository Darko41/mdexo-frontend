import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api/api';
import ImageUpload from '../ImageUpload';

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
	const imageUploadRef = useRef();
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
	});
	const [newFeature, setNewFeature] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [uploadedImages, setUploadedImages] = useState([]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleImagesChange = (imageFiles) => {
		console.log('Image files updated:', imageFiles);
		console.log('Number of images:', imageFiles.length);
		console.log('First image type:', imageFiles[0]?.constructor.name);
		setUploadedImages(imageFiles);
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

	const handleSubmit = async (e) => {
	  e.preventDefault();
	  setError(null);
	  
	  try {
	    setIsSubmitting(true);

	    // Validate required fields
	    if (!formData.title || !formData.price || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
	      setError('Please fill in all required fields');
	      setIsSubmitting(false);
	      return;
	    }

	    if (uploadedImages.length === 0) {
	      setError('Please upload at least one image');
	      setIsSubmitting(false);
	      return;
	    }

	    console.log('Starting bulk upload with', uploadedImages.length, 'images');

	    // Create FormData for bulk upload
	    const submitData = new FormData();
	    
	    const realEstateData = {
	      title: formData.title,
	      description: formData.description,
	      price: parseFloat(formData.price),
	      propertyType: formData.propertyType,
	      listingType: formData.listingType,
	      address: formData.address,
	      city: formData.city,
	      state: formData.state,
	      zipCode: formData.zipCode,
	      sizeInSqMt: formData.sizeInSqMt ? parseInt(formData.sizeInSqMt) : null,
	      features: formData.features,
	    };
	    
	    submitData.append('realEstate', new Blob([JSON.stringify(realEstateData)], {
	      type: 'application/json'
	    }));

	    // Append all image files for bulk upload
	    uploadedImages.forEach((imageFile, index) => {
	      submitData.append('images', imageFile);
	    });

	    console.log('Sending bulk upload request...');
	    
	    // Use the bulk upload endpoint
	    const response = await API.realEstates.createWithFormData(submitData);

	    console.log('Listing created successfully:', response.data);
	    navigate(`/property/${response.data.propertyId}`);
	    
	  } catch (error) {
	    console.error('Error creating listing:', error);
	    setError(
	      error.response?.data?.message || 
	      error.message || 
	      'Failed to create listing. Please try again.'
	    );
	  } finally {
	    setIsSubmitting(false);
	  }
	};

	// Helper function to format enum values for display
	const formatEnumDisplay = (value) => {
		return value.toLowerCase().replace(/_/g, ' ');
	};

	// Check if form is ready for submission
	const isFormValid = () => {
	  const isValid = (
	    formData.title &&
	    formData.price &&
	    formData.address &&
	    formData.city &&
	    formData.state &&
	    formData.zipCode &&
	    uploadedImages.length > 0 &&
	    !isSubmitting
	  );
	  
	  console.log('Form validation result:', isValid);
	  return isValid;
	};

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<h2 className="text-3xl font-bold text-gray-900 mb-8">Create a New Listing</h2>

			<form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
				{error && (
					<div className="p-4 bg-red-50 text-red-600 rounded-lg">
						{error}
					</div>
				)}

				{/* Title - Full Width */}
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
						placeholder="Enter property title"
					/>
				</div>

				{/* Description - Full Width */}
				<div>
					<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
						Description
					</label>
					<textarea
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows={3}
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
						placeholder="Describe your property..."
					/>
				</div>

				{/* Property Type, Listing Type, and Price - Compact Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
								placeholder="0.00"
							/>
						</div>
					</div>
				</div>

				{/* Address, Size, and Features - 3-column Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
							placeholder="Full street address"
						/>
					</div>

					<div>
						<label htmlFor="sizeInSqMt" className="block text-sm font-medium text-gray-700 mb-1">
							Size (m²)
						</label>
						<input
							type="number"
							id="sizeInSqMt"
							name="sizeInSqMt"
							value={formData.sizeInSqMt}
							onChange={handleChange}
							min="0"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
							placeholder="Square meters"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Features (max 10)
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={newFeature}
								onChange={(e) => setNewFeature(e.target.value)}
								className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
								placeholder="Add feature..."
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleAddFeature();
									}
								}}
							/>
							<button
								type="button"
								onClick={handleAddFeature}
								disabled={!newFeature || formData.features.length >= 10}
								className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
							>
								Add
							</button>
						</div>
					</div>
				</div>

				{/* Features Display */}
				{formData.features.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{formData.features.map((feature, index) => (
							<div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
								<span>{feature}</span>
								<button
									type="button"
									onClick={() => handleRemoveFeature(index)}
									className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
								>
									×
								</button>
							</div>
						))}
					</div>
				)}
				{formData.features.length >= 10 && (
					<p className="text-sm text-gray-500">Maximum 10 features reached</p>
				)}

				{/* Location Details - Compact Row */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
							placeholder="City"
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
							placeholder="State"
						/>
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
							placeholder="ZIP Code"
						/>
					</div>
				</div>

				{/* Image Upload Section */}
				<div className="border-t border-gray-200 pt-6">
					<h3 className="text-lg font-medium text-gray-900 mb-4">Property Images</h3>
					<p className="text-sm text-gray-600 mb-6">
						Upload high-quality photos of your property. The first image will be used as the cover photo.
						Images are automatically optimized for web viewing.
					</p>
					
					<ImageUpload 
						onImagesChange={handleImagesChange}
					/>
					
					{uploadedImages.length > 0 && (
						<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
							<p className="text-green-800 text-sm">
								✓ {uploadedImages.length} image(s) ready for your listing
							</p>
						</div>
					)}
				</div>

				{/* Submit Button */}
				<div className="border-t border-gray-200 pt-6 flex justify-end">
				  <button
				    type="submit"
				    disabled={!(
				      formData.title &&
				      formData.price &&
				      formData.address &&
				      formData.city &&
				      formData.state &&
				      formData.zipCode &&
				      uploadedImages.length > 0 &&
				      !isSubmitting
				    )}
				    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
				  >
				    {isSubmitting ? (
				      <>
				        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
				        <span>Creating Listing...</span>
				      </>
				    ) : (
				      <span>Create Listing</span>
				    )}
  				</button>
				</div>
			</form>
		</div>
	);
}