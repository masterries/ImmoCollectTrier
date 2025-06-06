// src/utils/geo.ts

// Haversine formula to calculate distance between two points
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance; // Returns distance in kilometers
  }
  
  function toRad(degrees: number): number {
    return degrees * (Math.PI/180);
  }
  
  // Trier coordinates
  export const TRIER_COORDS = {
    lat: 49.7592,
    lng: 6.6417
  };
  
  // Default radius for Trier area in kilometers
  export const DEFAULT_RADIUS = 50;