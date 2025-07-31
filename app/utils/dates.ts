import {format} from "date-fns";
import {lv} from "date-fns/locale";

import type {MonthData} from "@/app/types";

export function getTodaysIndex(vardūs: MonthData[]): number {
	const todayDay = format(new Date(), "dd");
	const todayMonth = format(new Date(), "LLLL", {locale: lv});
	const capitalisedMonth =
		todayMonth.charAt(0).toUpperCase() + todayMonth.slice(1);

	let insideMonth = false;

	for (let i = 0; i < vardūs.length; i++) {
		const item = vardūs[i];

		if (typeof item === "string") {
			insideMonth = item === capitalisedMonth;
			continue;
		}

		if (insideMonth && item.diena === todayDay) {
			return i;
		}
	}

	return 0;
}

/**
 * Checks if today is someone's name day
 * @param day - The day of the name day (e.g., "3", "03")
 * @param month - The month of the name day (e.g., "Jūlijs")
 * @returns boolean indicating if today is the name day
 */
export function isTodayNameDay(day: string, month: string): boolean {
	const today = new Date();
	const todayDay = format(today, "dd");
	const todayMonth = format(today, "LLLL", {locale: lv});
	const capitalisedTodayMonth =
		todayMonth.charAt(0).toUpperCase() + todayMonth.slice(1);

	// Add debug logging to help identify issues on real devices
	console.log("🔍 Debug: isTodayNameDay check:");
	console.log("  - Input day:", day, "Input month:", month);
	console.log(
		"  - Today day:",
		todayDay,
		"Today month:",
		capitalisedTodayMonth,
	);
	console.log("  - Day match:", todayDay === day);
	console.log("  - Month match:", capitalisedTodayMonth === month);
	console.log(
		"  - Result:",
		todayDay === day && capitalisedTodayMonth === month,
	);

	return todayDay === day && capitalisedTodayMonth === month;
}
