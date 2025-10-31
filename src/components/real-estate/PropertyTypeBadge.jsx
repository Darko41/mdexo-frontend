import PropTypes from 'prop-types';

export default function PropertyTypeBadge({ type, showText = true, additionalInfo = null }) {
  const typeConfig = {
    HOUSE: { icon: '🏠', color: 'bg-green-100 text-green-800', label: 'House' },
    APARTMENT: { icon: '🏢', color: 'bg-purple-100 text-purple-800', label: 'Apartment' },
    CONDO: { icon: '🏙️', color: 'bg-blue-100 text-blue-800', label: 'Condo' },
    LAND: { icon: '🌱', color: 'bg-yellow-100 text-yellow-800', label: 'Land' },
    GARRAGE: { icon: '🚗', color: 'bg-gray-100 text-gray-800', label: 'Garage' },
    COMMERCIAL: { icon: '🏬', color: 'bg-orange-100 text-orange-800', label: 'Commercial' },
    OTHER: { icon: '🏘️', color: 'bg-gray-100 text-gray-800', label: 'Other' }
  };

  // Helper function to format additional info
  const formatAdditionalInfo = (info) => {
    if (!info) return '';
    
    const parts = [];
    
    // Room count
    if (info.roomCount) {
      if (info.roomCount === 0.5) {
        parts.push('Studio');
      } else {
        parts.push(`${info.roomCount} ${info.roomCount === 1 ? 'room' : 'rooms'}`);
      }
    }
    
    // Floor information
    if (info.floor !== undefined && info.totalFloors !== undefined) {
      if (info.floor === 0) {
        parts.push('Ground floor');
      } else if (info.floor < 0) {
        parts.push(`${Math.abs(info.floor)}. basement`);
      } else {
        parts.push(`${info.floor}. floor`);
      }
    }
    
    return parts.length > 0 ? ` • ${parts.join(' • ')}` : '';
  };

  // Helper function to get property condition badge
  const getConditionBadge = (condition) => {
    const conditionConfig = {
      NEW_CONSTRUCTION: { color: 'bg-emerald-100 text-emerald-800', label: 'New' },
      RENOVATED: { color: 'bg-teal-100 text-teal-800', label: 'Renovated' },
      MODERNIZED: { color: 'bg-cyan-100 text-cyan-800', label: 'Modernized' },
      GOOD: { color: 'bg-blue-100 text-blue-800', label: 'Good' },
      NEEDS_RENOVATION: { color: 'bg-amber-100 text-amber-800', label: 'Needs Reno' },
      ORIGINAL: { color: 'bg-violet-100 text-violet-800', label: 'Original' },
      LUXURY: { color: 'bg-pink-100 text-pink-800', label: 'Luxury' },
      SHELL: { color: 'bg-stone-100 text-stone-800', label: 'Shell' },
      OTHER: { color: 'bg-gray-100 text-gray-800', label: 'Other' }
    };
    
    return conditionConfig[condition] || null;
  };

  // Helper function to get heating type icon
  const getHeatingIcon = (heatingType) => {
    const heatingIcons = {
      CENTRAL: '🔥',
      DISTRICT: '🏭',
      ELECTRIC: '⚡',
      GAS: '⛽',
      HEAT_PUMP: '🌡️',
      SOLAR: '☀️',
      WOOD_PELLET: '🪵',
      OIL: '🛢️',
      NONE: '❄️',
      OTHER: '🏠'
    };
    
    return heatingIcons[heatingType] || '🔥';
  };

  const config = typeConfig[type] || typeConfig.OTHER;
  const additionalText = formatAdditionalInfo(additionalInfo);
  const conditionBadge = additionalInfo?.propertyCondition ? getConditionBadge(additionalInfo.propertyCondition) : null;
  const heatingIcon = additionalInfo?.heatingType ? getHeatingIcon(additionalInfo.heatingType) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Main Property Type Badge */}
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.icon}
        {showText && (
          <>
            <span className="ml-1">{config.label}</span>
            {additionalText && (
              <span className="ml-1 opacity-75">{additionalText}</span>
            )}
          </>
        )}
      </span>

      {/* Condition Badge (if available) */}
      {conditionBadge && (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${conditionBadge.color}`}>
          {conditionBadge.label}
        </span>
      )}

      {/* Heating Icon (if available) */}
      {heatingIcon && (
        <span className="inline-flex items-center text-xs opacity-70" title={additionalInfo.heatingType?.replace(/_/g, ' ').toLowerCase()}>
          {heatingIcon}
        </span>
      )}

      {/* Age Badge (if construction year available) */}
      {additionalInfo?.constructionYear && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          Built {additionalInfo.constructionYear}
          {additionalInfo.propertyAge && (
            <span className="ml-1 opacity-75">
              ({additionalInfo.propertyAge} {additionalInfo.propertyAge === 1 ? 'year' : 'years'})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

// Prop types for better development
PropertyTypeBadge.propTypes = {
  type: PropTypes.string.isRequired,
  showText: PropTypes.bool,
  additionalInfo: PropTypes.shape({
    roomCount: PropTypes.number,
    floor: PropTypes.number,
    totalFloors: PropTypes.number,
    constructionYear: PropTypes.number,
    propertyAge: PropTypes.number,
    propertyCondition: PropTypes.string,
    heatingType: PropTypes.string
  })
};

// Default props
PropertyTypeBadge.defaultProps = {
  showText: true,
  additionalInfo: null
};