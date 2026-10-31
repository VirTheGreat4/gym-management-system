/**
 * Checks if a special closed date string (YYYY-MM-DD) has expired.
 * Compares against normalized local start-of-day and UTC start-of-day timestamps
 * to prevent premature expiration or lingering entries past midnight due to timezone differences.
 */
export function isSpecialClosedDateExpired(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return true;

  const now = new Date();

  // Local start of day YYYY-MM-DD
  const localYear = now.getFullYear();
  const localMonth = String(now.getMonth() + 1).padStart(2, "0");
  const localDay = String(now.getDate()).padStart(2, "0");
  const localToday = `${localYear}-${localMonth}-${localDay}`;

  // UTC start of day YYYY-MM-DD
  const utcToday = now.toISOString().split("T")[0];

  // Date is expired only if it is strictly before both local and UTC today's date
  return dateStr < localToday && dateStr < utcToday;
}
