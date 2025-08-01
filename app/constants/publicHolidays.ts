export interface PublicHoliday {
	month: number;
	day: number;
	title: string;
	titleLv: string;
	emoji: string;
	isMoveable?: boolean;
	description?: string;
}

export const publicHolidays: PublicHoliday[] = [
	{
		month: 1,
		day: 1,
		title: "New Year's Day",
		titleLv: "Jaunais gads",
		emoji: "🎉",
	},
	{
		month: 5,
		day: 1,
		title: "Satversme Assembly Day",
		titleLv: "Satversmes sapulces diena",
		emoji: "🏛️",
	},
	{
		month: 5,
		day: 4,
		title: "Restoration of Independence Day",
		titleLv: "Neatkarības atjaunošanas diena",
		emoji: "🇱🇻",
	},
	{
		month: 6,
		day: 23,
		title: "Līgo Day",
		titleLv: "Līgo",
		emoji: "🌿",
	},
	{
		month: 6,
		day: 24,
		title: "Midsummer Day",
		titleLv: "Jāņi",
		emoji: "🔥",
		description: "Nationally most important celebration",
	},
	{
		month: 11,
		day: 18,
		title: "Proclamation Day of the Republic of Latvia",
		titleLv: "Latvijas Republikas proklamēšanas diena",
		emoji: "📜",
	},
	{
		month: 12,
		day: 24,
		title: "Christmas Eve",
		titleLv: "Ziemassvētku vakars",
		emoji: "🎄",
	},
	{
		month: 12,
		day: 25,
		title: "Christmas",
		titleLv: "Ziemassvētki",
		emoji: "🎁",
	},
	{
		month: 12,
		day: 26,
		title: "Boxing Day",
		titleLv: "Otrie Ziemassvētki",
		emoji: "📦",
	},
	{
		month: 12,
		day: 31,
		title: "New Year's Eve",
		titleLv: "Vecgada vakars",
		emoji: "🎊",
	},
];
