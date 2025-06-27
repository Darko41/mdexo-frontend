export default function PropertyTypeBadge({ type, showText = true }) {
  const typeConfig = {
    APARTMENT: { icon: '🏢', color: 'bg-purple-100 text-purple-800', label: 'Apartment' },
    HOUSE: { icon: '🏠', color: 'bg-green-100 text-green-800', label: 'House' },
    LAND: { icon: '🌱', color: 'bg-yellow-100 text-yellow-800', label: 'Land' },
    COMMERCIAL: { icon: '🏢', color: 'bg-blue-100 text-blue-800', label: 'Commercial' }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      typeConfig[type]?.color || 'bg-gray-100 text-gray-800'
    }`}>
      {typeConfig[type]?.icon || '🏠'}
      {showText && ` ${typeConfig[type]?.label || type}`}
    </span>
  );
}