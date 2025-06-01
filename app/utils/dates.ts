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
