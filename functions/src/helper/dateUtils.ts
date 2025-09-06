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

  return undefined; // Return undefined if format is unrecognized
}