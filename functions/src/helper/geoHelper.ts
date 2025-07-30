import { Coordinate } from "../models/Coordinate";

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 *
 * @param {Coordinate} coord1 - The first coordinate (latitude and longitude).
 * @param {Coordinate} coord2 - The second coordinate.
 * @return {number} The distance in kilometers.
 */

export function getDistance(coord1: Coordinate, coord2: Coordinate): number {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in km
  const lat1 = coord1.latitude;
  const lon1 = coord1.longitude;
  const lat2 = coord2.latitude;
  const lon2 = coord2.longitude;

  // distance between latitudes
  const dLat = toRad(lat2 - lat1);
  // and longitudes
  const dLon = toRad(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  // Calculate the distance
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
