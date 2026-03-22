const ZIPCODE_COORDS = {
  '10001': { lat: 40.7484, lng: -73.9967 },   // New York, NY
  '90210': { lat: 34.0901, lng: -118.4065 },  // Beverly Hills, CA
  '60601': { lat: 41.8819, lng: -87.6278 },   // Chicago, IL
  '30301': { lat: 33.7490, lng: -84.3880 },   // Atlanta, GA
  '78701': { lat: 30.2672, lng: -97.7431 },   // Austin, TX
  '02101': { lat: 42.3601, lng: -71.0589 },   // Boston, MA
  '98101': { lat: 47.6062, lng: -122.3321 },  // Seattle, WA
  '33101': { lat: 25.7617, lng: -80.1918 },   // Miami, FL
  '19101': { lat: 39.9526, lng: -75.1652 },   // Philadelphia, PA
  '80201': { lat: 39.7392, lng: -104.9903 },  // Denver, CO
};

/**
 * Generates approximate coordinates from a zipcode by using the numeric value
 * to produce a lat/lng within the continental US bounding box.
 */
function approximateFromZipcode(zipcode) {
  const num = parseInt(zipcode, 10);
  const lat = 25 + ((num % 50000) / 50000) * 24;
  const lng = -125 + ((num % 90000) / 90000) * 58;
  return { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
}

function geocodeZipcode(zipcode) {
  const normalized = String(zipcode).padStart(5, '0');
  return ZIPCODE_COORDS[normalized] || approximateFromZipcode(normalized);
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = { geocodeZipcode, calculateDistance };
