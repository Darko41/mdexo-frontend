import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateListingForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT', // Default to match your enum
    listingType: 'FOR_SALE',  // Default to match your enum
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    sizeInSqMt: '',
    features: [],
    images: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      // Get presigned URL for each file
      const uploadUrls = await Promise.all(
        Array.from(files).map(file => {
          const fileName = `real-estates/${Date.now()}-${file.name}`;
          return fetch(`/api/s3/generate-presigned-url?fileName=${encodeURIComponent(fileName)}`)
            .then(res => res.json());
        })
      );

      // Upload files to S3 using the presigned URLs
      await Promise.all(
        Array.from(files).map((file, index) => {
          return fetch(uploadUrls[index], {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });
        })
      );

      // Save image URLs to form data
      const imageUrls = uploadUrls.map(url => url.split('?')[0]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/real-estates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: formData.images // Assuming you'll add this field to RealEstate
        })
      });

      if (response.ok) {
        navigate('/success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">List Your Property</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Property Information</h2>
          
          <div>
            <label className="block mb-1">Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Property Type*</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="LAND">Land</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">Listing Type*</label>
              <select
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="FOR_SALE">For Sale</option>
                <option value="FOR_RENT">For Rent</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pricing</h2>
          
          <div>
            <label className="block mb-1">Price*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        {/* Location */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Location</h2>
          
          <div>
            <label className="block mb-1">Address*</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-1">City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1">State*</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block mb-1">ZIP Code*</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Property Details</h2>
          
          <div>
            <label className="block mb-1">Size (sqm)</label>
            <input
              type="text"
              name="sizeInSqMt"
              value={formData.sizeInSqMt}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block mb-1">Features</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Add feature (e.g. 'Swimming pool')"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-gray-200 px-4 rounded"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Photos</h2>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded"
          />
          <div className="flex flex-wrap gap-2">
            {formData.images.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`Property ${index + 1}`} 
                className="h-24 object-cover rounded"
              />
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  );
}