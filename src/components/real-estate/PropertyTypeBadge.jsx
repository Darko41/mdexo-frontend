export default function PropertyTypeBadge({ type, showText = true }) {
  const typeConfig = {
    HOUSE: { icon: '🏠', color: 'bg-green-100 text-green-800', label: 'House' },
    APARTMENT: { icon: '🏢', color: 'bg-purple-100 text-purple-800', label: 'Apartment' },
    CONDO: { icon: '🏙️', color: 'bg-blue-100 text-blue-800', label: 'Condo' },
    LAND: { icon: '🌱', color: 'bg-yellow-100 text-yellow-800', label: 'Land' },
    GARRAGE: { icon: '🚗', color: 'bg-gray-100 text-gray-800', label: 'Garage' },
    COMMERCIAL: { icon: '🏬', color: 'bg-orange-100 text-orange-800', label: 'Commercial' },
    OTHER: { icon: '🏘️', color: 'bg-gray-100 text-gray-800', label: 'Other' }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
      typeConfig[type]?.color || 'bg-gray-100 text-gray-800'
    }`}>
      {typeConfig[type]?.icon || '🏠'}
      {showText && ` ${typeConfig[type]?.label || type}`}
    </span>
  );
}