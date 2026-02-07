/**
 * Filter properties based on filter criteria
 * @param  {Array} properties - Array of all properties
 * @param  {Object} filters - The filters being applied to the properties
 * @return {Array} - Array of properties that match the given filters
 */
export const filterProperties = (properties, filters) => {
  if (!properties || !properties.length) {
    return [];
  }

  const {
    locationFilter,
    rateFilter,
    starsFilter,
    houseTypeFilter,
    placeTypeFilter,
    superHostFilter,
  } = filters;
  const houseTypeSet = new Set(houseTypeFilter);
  const placeTypeSet = new Set(placeTypeFilter);

  let hostAveragesMap = null;
  if (superHostFilter) {
    hostAveragesMap = new Map();
    const hostRatings = {};

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      if (!hostRatings[property.hostId]) {
        hostRatings[property.hostId] = { total: 0, count: 0 };
      }
      hostRatings[property.hostId].total += property.stars;
      hostRatings[property.hostId].count += 1;
    }

    const hostIds = Object.keys(hostRatings);
    for (let i = 0; i < hostIds.length; i++) {
      const hostId = hostIds[i];
      const average = hostRatings[hostId].total/hostRatings[hostId].count;
      hostAveragesMap.set(Number(hostId), average);
    }
  }

  const failsRangeCheck = (range, field) => range && (range[0] > field || range[1] < field);
  const failsSetCheck = (set, field) => set.size > 0 && !set.has(field);

  return properties.filter((property) => {
    if (locationFilter && locationFilter !== property.country) {
      return false;
    }

    if (superHostFilter && !isSuperHost(property, properties, hostAveragesMap)) {
      return false;
    }

    if (
      failsRangeCheck(rateFilter, property.rate) ||
      failsRangeCheck(starsFilter, property.stars)
    ) {
      return false;
    }

    if (
      failsSetCheck(houseTypeSet, property.houseType) ||
      failsSetCheck(placeTypeSet, property.placeType)
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Determine if the host of the specified `property` is a "Super Host". A Super Host is a host with an average start
 * rating of 4 or more across all of their properties.
 * @param {Object} property - The property currently being checked for "Super Host" status
 * @param {Array} allProperties - Array of all properties
 * @param {Map} hostAveragesMap - Optional map of hostId to average rating (for efficiency)
 * @return {Boolean} - true if the host of `property` is a "Super Host". Otherwise false.
 */
function isSuperHost(property, allProperties, hostAveragesMap) {
  if (hostAveragesMap) {
    const average = hostAveragesMap.get(property.hostId);
    return average !== undefined && average >= 4;
  }

  const hostProperties = allProperties.filter((p) => p.hostId === property.hostId);
  let totalStars = 0;
  for (let i = 0; i < hostProperties.length; i++) {
    totalStars += hostProperties[i].stars;
  }
  const average = totalStars/hostProperties.length;
  return average >= 4 ? true : false;
}

export const RATE_FILTER_META = {
  MIN: 0,
  MAX: 2000,
};

export const STAR_FILTER_META = {
  MIN: 0,
  MAX: 5,
};

export const DEFAULT_FILTERS = {
  locationFilter: null,
  placeTypeFilter: [],
  houseTypeFilter: [],
  superHostFilter: false,
  rateFilter: [RATE_FILTER_META.MIN, RATE_FILTER_META.MAX],
  starsFilter: [STAR_FILTER_META.MIN, STAR_FILTER_META.MAX],
};
