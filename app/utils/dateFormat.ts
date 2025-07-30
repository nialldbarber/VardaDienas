import {language$} from "@/app/store/language";
import {format} from "date-fns";
import {enUS, lv} from "date-fns/locale";

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
 * Returns the current date formatted for header display
 * @param getMonthTranslation - Function to get month translation
 * @returns Formatted date string
 */
export function getCurrentDateHeader(
	getMonthTranslation: (key: string) => string,
): string {
	const currentLanguage = language$.currentLanguage.get();
	const currentDate = new Date();
	const day = format(currentDate, "d");

	// Use the appropriate locale based on current language
	const locale = currentLanguage === "en" ? enUS : lv;
	const monthKey = format(currentDate, "LLLL", {locale});
	const month = getMonthTranslation(`months.${monthKey}`);

	return formatDateHeader(day, month);
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
