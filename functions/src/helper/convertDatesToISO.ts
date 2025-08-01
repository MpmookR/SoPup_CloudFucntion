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


// Converts an array of scored dogs, converting each dog's dob to ISO string
// used after receiving a dog object (e.g., in backend when processing dob from Firestore or request body)
export function normalizeDob(dob: any): Date | undefined {
  if (!dob) return undefined;

  // Firestore Timestamp
  if (typeof dob === "object" && "_seconds" in dob) {
    return new Date(dob._seconds * 1000);
  }

  // ISO string
  if (typeof dob === "string") {
    return new Date(dob);
  }

  // Already a JS Date
  if (dob instanceof Date) {
    return dob;
  }

  return undefined;
}
