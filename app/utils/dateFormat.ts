import {language$} from "@/app/store/language";

/**
 * Formats a date for display according to language-specific conventions
 * @param day - The day number (e.g., "3", "03")
 * @param month - The translated month name
 * @returns Formatted date string
 */
export function formatDateHeader(day: string, month: string): string {
	const currentLanguage = language$.currentLanguage.get();
	const dayNumber = Number.parseInt(day, 10);

	if (currentLanguage === "en") {
		// English format: "3rd July"
		const ordinalSuffix = getOrdinalSuffix(dayNumber);
		return `${dayNumber}${ordinalSuffix} ${month}`;
	}

	// Latvian format: "3. jūlijs" (lowercase month)
	return `${dayNumber}. ${month.toLowerCase()}`;
}

/**
 * Returns the ordinal suffix for English numbers (st, nd, rd, th)
 */
function getOrdinalSuffix(day: number): string {
	if (day >= 11 && day <= 13) {
		return "th";
	}

	switch (day % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}
