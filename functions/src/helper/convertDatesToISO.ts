/**
 *
 * Recursively walks through an object and converts any Firestore Timestamp
 * fields or native Date objects into ISO 8601 strings.
 *
 * Key Responsibilities:
 * - Detect Firestore Timestamp objects (with `_seconds` property) and convert them
 *   into ISO strings.
 * - Detect arrays and process their elements recursively.
 * - Traverse nested objects safely and apply conversion to all fields.
 *
 * Usage:
 * Use when serializing Firestore data for the frontend, so all date-like values
 * are consistent ISO strings instead of mixed Date/Timestamp formats.
 * 
 * Example Firestore Timestamp object: { _seconds: 1633036800, _nanoseconds: 0 }
 * Example Date object: new Date('2021-10-01T00:00:00Z')
 * Example ISO string: '2021-10-01T00:00:00.000Z'
 */

// Converts dob field to ISO string if it's a Date
export function convertDatesToISO(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  // Handle Firestore Timestamp
  if (typeof obj === "object" && "_seconds" in obj && typeof obj._seconds === "number") {
    return new Date(obj._seconds * 1000).toISOString(); // Return ISO string directly
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToISO);
  }

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = convertDatesToISO(obj[key]); // recursively convert nested fields
    }
  }
  return result;
}
