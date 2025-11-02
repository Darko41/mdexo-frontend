// Centralized image URL handling with consistent fallbacks
export const getPropertyImageUrl = (property, index = 0) => {
  // Priority 1: Use existing image URL from property
  if (property.imageUrl) {
    return property.imageUrl;
  }
  
  // Priority 2: Use images array
  if (property.images && property.images.length > 0) {
    const image = property.images[index] || property.images[0];
    if (image && isValidUrl(image)) {
      return image;
    }
  }
  
  // Priority 3: Development fallback - consistent placeholder per property
  if (import.meta.env.MODE === 'development') {
    const propertyId = property.propertyId || property.id;
    const seed = propertyId ? `property-${propertyId}` : `random-${Math.random()}`;
    return `https://picsum.photos/400/300?random=${seed}`;
  }
  
  // Priority 4: Production fallback
  return '/default-property.jpg';
};

export const isValidUrl = (url) => {
  if (!url) return false;
  
  // Reject mock:// URLs
  if (url.startsWith('mock://')) return false;
  
  // Reject invalid URLs
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const handleImageError = (e, fallbackUrl = '/default-property.jpg') => {
  // Only set fallback if not already set to prevent infinite loops
  if (e.target.src !== fallbackUrl) {
    e.target.src = fallbackUrl;
  }
};