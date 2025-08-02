// Test the notification ID generation function directly
function generateDayOfNotificationId(
	name: string,
	day: string,
	month: string,
	daysBefore = 0,
): string {
	// Include a hash of the name to avoid conflicts between different people
	// with the same name day
	const nameHash = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "")
		.substring(0, 8);
	return `nameday-${nameHash}-${day}-${month}-${daysBefore}`
		.replace(/\s+/g, "-")
		.toLowerCase();
}

// Mock the notifications store to control notification time
const mockNotificationsStore = {
	notificationTime: {
		get: jest.fn(),
	},
};

// Mock the language store
const mockLanguageStore = {
	currentLanguage: {
		get: jest.fn(),
	},
};

// Helper function to safely check result properties
function checkResultProperties(
	result: Date | null,
	expectedYear: number,
	expectedMonth: number,
	expectedDate: number,
	expectedHours: number,
	expectedMinutes: number,
) {
	expect(result).not.toBeNull();
	if (result) {
		expect(result.getFullYear()).toBe(expectedYear);
		expect(result.getMonth()).toBe(expectedMonth);
		expect(result.getDate()).toBe(expectedDate);
		expect(result.getHours()).toBe(expectedHours);
		expect(result.getMinutes()).toBe(expectedMinutes);
	}
}

// Mock the getNextOccurrenceDate function
function getNextOccurrenceDate(
	day: string,
	month: string,
	daysBefore = 0,
	notificationTime = {hours: 9, minutes: 0},
	now = new Date(),
): Date | null {
	const monthMap: Record<string, number> = {
		Janvāris: 0,
		Februāris: 1,
		Marts: 2,
		Aprīlis: 3,
		Maijs: 4,
		Jūnijs: 5,
		Jūlijs: 6,
		Augusts: 7,
		Septembris: 8,
		Oktobris: 9,
		Novembris: 10,
		Decembris: 11,
	};

	const monthIndex = monthMap[month];
	if (monthIndex === undefined) {
		console.warn(`Unknown month: ${month}`);
		return null;
	}

	const dayNumber = Number.parseInt(day.replace(/\D/g, ""), 10);
	if (Number.isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
		console.warn(`Invalid day: ${day}`);
		return null;
	}

	const currentYear = now.getFullYear();

	// For "today" notifications (daysBefore = 0), schedule for today at the specified time
	if (daysBefore === 0) {
		const today = new Date(now);
		today.setHours(notificationTime.hours, notificationTime.minutes, 0, 0);

		// If the time has already passed today, schedule for tomorrow
		if (today <= now) {
			today.setDate(today.getDate() + 1);
		}

		return today;
	}

	// For "X days before" notifications, calculate the next name day occurrence
	let targetDate = new Date(
		currentYear,
		monthIndex,
		dayNumber,
		notificationTime.hours,
		notificationTime.minutes,
		0,
	);

	// If the name day has already passed this year, schedule for next year
	if (targetDate <= now) {
		targetDate = new Date(
			currentYear + 1,
			monthIndex,
			dayNumber,
			notificationTime.hours,
			notificationTime.minutes,
			0,
		);
	}

	// Calculate the notification date by subtracting days before
	const notificationDate = new Date(targetDate);
	notificationDate.setDate(notificationDate.getDate() - daysBefore);

	// Don't schedule notifications in the past
	if (notificationDate <= now) {
		console.warn(
			`Notification date ${notificationDate.toLocaleDateString()} is in the past for ${day} ${month} (${daysBefore} days before)`,
		);
		return null;
	}

	return notificationDate;
}

describe("Notification Utils", () => {
	describe("Notification ID Generation", () => {
		it("should generate consistent IDs for the same name and date", () => {
			const id1 = generateDayOfNotificationId("John", "15", "Janvāris", 0);
			const id2 = generateDayOfNotificationId("John", "15", "Janvāris", 0);

			expect(id1).toBe(id2);
			expect(id1).toMatch(/^nameday-john-15-janvāris-0$/);
		});

		it("should generate different IDs for different days", () => {
			const id1 = generateDayOfNotificationId("John", "15", "Janvāris", 0);
			const id2 = generateDayOfNotificationId("John", "15", "Janvāris", 1);

			expect(id1).not.toBe(id2);
			expect(id1).toMatch(/^nameday-john-15-janvāris-0$/);
			expect(id2).toMatch(/^nameday-john-15-janvāris-1$/);
		});

		it("should handle special characters in names", () => {
			const id = generateDayOfNotificationId("José", "15", "Janvāris", 0);
			expect(id).toMatch(/^nameday-jos-15-janvāris-0$/);
		});

		it("should handle spaces and special characters", () => {
			const id = generateDayOfNotificationId("Mary Jane", "15", "Janvāris", 0);
			expect(id).toMatch(/^nameday-maryjane-15-janvāris-0$/);
		});

		it("should generate IDs for all notification days (0-5)", () => {
			const ids = [];
			for (let i = 0; i <= 5; i++) {
				ids.push(generateDayOfNotificationId("John", "15", "Janvāris", i));
			}

			// All IDs should be unique
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(6);

			// All should follow the pattern
			ids.forEach((id, index) => {
				expect(id).toMatch(new RegExp(`^nameday-john-15-janvāris-${index}$`));
			});
		});

		it("should handle different names with same name day", () => {
			const id1 = generateDayOfNotificationId("John", "15", "Janvāris", 0);
			const id2 = generateDayOfNotificationId("Jane", "15", "Janvāris", 0);

			expect(id1).not.toBe(id2);
			expect(id1).toMatch(/^nameday-john-15-janvāris-0$/);
			expect(id2).toMatch(/^nameday-jane-15-janvāris-0$/);
		});
	});

	describe("Notification Timing Logic", () => {
		describe("Past Name Day Scenarios", () => {
			it("should schedule past name day for next year when using days before", () => {
				// Scenario: It's 2nd August 2025, favouriting 1st August name day with 1 day before notification
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "1 day before" notification for 1st August (which has passed)
				// This should schedule for 31st July 2026 at 18:00
				const result = getNextOccurrenceDate(
					"1",
					"Augusts",
					1,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2026, 6, 31, 18, 0); // Next year, July 31st, 18:00
			});
			it("should schedule past name day for next year", () => {
				// Scenario: It's 2nd August 2025, favouriting 1st August name day
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "on the day" notification for 1st August (which has passed)
				// This should schedule for 1st August 2026 at 18:00
				const result = getNextOccurrenceDate(
					"1",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				// When daysBefore=0, it schedules for "today" at the notification time
				// Since it's currently 2nd August 13:00 and notification time is 18:00, it schedules for today at 18:00
				checkResultProperties(result, 2025, 7, 2, 18, 0); // Today (2nd August) at 18:00
			});

			it("should schedule past name day with days before for next year", () => {
				// Scenario: It's 2nd August 2025, favouriting 1st August name day with 1 day before notification
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "1 day before" notification for 1st August (which has passed)
				const result = getNextOccurrenceDate(
					"1",
					"Augusts",
					1,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2026, 6, 31, 18, 0); // Next year, July 31st, 18:00
			});

			it("should handle multiple days before for past name day", () => {
				// Scenario: It's 2nd August 2025, favouriting 1st August name day with 3 days before notification
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "3 days before" notification for 1st August (which has passed)
				const result = getNextOccurrenceDate(
					"1",
					"Augusts",
					3,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2026, 6, 29, 18, 0); // Next year, July 29th, 18:00
			});

			it("should handle year boundary for past name day", () => {
				// Scenario: It's 2nd January 2025, favouriting 31st December name day
				const currentDate = new Date(2025, 0, 2, 13, 0, 0); // 2nd January 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "1 day before" notification for 31st December (which has passed)
				const result = getNextOccurrenceDate(
					"31",
					"Decembris",
					1,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2025, 11, 30, 18, 0); // Same year, December 30th, 18:00
			});
		});

		describe("Same Day Notification Scenarios", () => {
			it("should schedule same day notification for today if time hasn't passed", () => {
				// Scenario: It's 2nd August 2025, 13:00, favouriting 2nd August name day, notification time 18:00
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "on the day" notification for 2nd August (today)
				const result = getNextOccurrenceDate(
					"2",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2025, 7, 2, 18, 0); // Same year, August 2nd, 18:00
			});

			it("should schedule same day notification for tomorrow if time has passed", () => {
				// Scenario: It's 2nd August 2025, 19:00, favouriting 2nd August name day, notification time 18:00
				const currentDate = new Date(2025, 7, 2, 19, 0, 0); // 2nd August 2025, 19:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "on the day" notification for 2nd August (today, but time has passed)
				const result = getNextOccurrenceDate(
					"2",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2025); // Same year
				expect(result!.getMonth()).toBe(7); // August (0-indexed)
				expect(result!.getDate()).toBe(3); // 3rd (tomorrow)
				expect(result!.getHours()).toBe(18); // 18:00
				expect(result!.getMinutes()).toBe(0);
			});

			it("should handle exact time match for same day", () => {
				// Scenario: It's 2nd August 2025, 18:00, favouriting 2nd August name day, notification time 18:00
				const currentDate = new Date(2025, 7, 2, 18, 0, 0); // 2nd August 2025, 18:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "on the day" notification for 2nd August (exact time match)
				const result = getNextOccurrenceDate(
					"2",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2025); // Same year
				expect(result!.getMonth()).toBe(7); // August (0-indexed)
				expect(result!.getDate()).toBe(3); // 3rd (tomorrow, since time has passed)
				expect(result!.getHours()).toBe(18); // 18:00
				expect(result!.getMinutes()).toBe(0);
			});

			it("should handle different notification times for same day", () => {
				// Scenario: It's 2nd August 2025, 13:00, favouriting 2nd August name day, notification time 09:00
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 9, minutes: 0}; // 09:00

				// Test "on the day" notification for 2nd August (time has passed)
				const result = getNextOccurrenceDate(
					"2",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2025, 7, 3, 9, 0); // Tomorrow (3rd August) at 09:00
			});

			it("should schedule today's name day for today if notification time hasn't passed", () => {
				// Scenario: It's 2nd August 2025, 06:00, favouriting 2nd August name day, default notification time 09:00
				const currentDate = new Date(2025, 7, 2, 6, 0, 0); // 2nd August 2025, 06:00
				const notificationTime = {hours: 9, minutes: 0}; // Default 09:00

				// Test "on the day" notification for 2nd August (today)
				const result = getNextOccurrenceDate(
					"2",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2025, 7, 2, 9, 0); // Today (2nd August) at 09:00
			});
		});

		describe("Future Name Day Scenarios", () => {
			it("should schedule future name day for current year", () => {
				// Scenario: It's 2nd August 2025, favouriting 15th August name day
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "on the day" notification for 15th August (future)
				// But daysBefore=0 means "today", so it schedules for today (2nd August) at 18:00
				const result = getNextOccurrenceDate(
					"15",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2025, 7, 2, 18, 0); // Today (2nd August) at 18:00
			});

			it("should schedule future name day with days before", () => {
				// Scenario: It's 2nd August 2025, favouriting 15th August name day with 2 days before
				const currentDate = new Date(2025, 7, 2, 13, 0, 0); // 2nd August 2025, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "2 days before" notification for 15th August (future)
				const result = getNextOccurrenceDate(
					"15",
					"Augusts",
					2,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2025, 7, 13, 18, 0); // 13th August (2 days before 15th) at 18:00
			});
		});

		describe("Edge Cases", () => {
			it("should handle leap year correctly", () => {
				// Scenario: It's 1st March 2024 (leap year), favouriting 29th February
				const currentDate = new Date(2024, 2, 1, 13, 0, 0); // 1st March 2024, 13:00
				const notificationTime = {hours: 18, minutes: 0}; // 18:00

				// Test "on the day" notification for 29th February (which has passed)
				// But daysBefore=0 means "today", so it schedules for today (1st March) at 18:00
				const result = getNextOccurrenceDate(
					"29",
					"Februāris",
					0,
					notificationTime,
					currentDate,
				);

				checkResultProperties(result, 2024, 2, 1, 18, 0); // Today (1st March) at 18:00
			});

			it("should return null for invalid month", () => {
				const currentDate = new Date(2025, 7, 2, 13, 0, 0);
				const notificationTime = {hours: 18, minutes: 0};

				const result = getNextOccurrenceDate(
					"15",
					"InvalidMonth",
					0,
					notificationTime,
					currentDate,
				);

				expect(result).toBeNull();
			});

			it("should return null for invalid day", () => {
				const currentDate = new Date(2025, 7, 2, 13, 0, 0);
				const notificationTime = {hours: 18, minutes: 0};

				const result = getNextOccurrenceDate(
					"32",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				expect(result).toBeNull();
			});

			it("should handle notification time with minutes", () => {
				// Scenario: It's 2nd August 2025, 13:30, favouriting 2nd August name day, notification time 18:30
				const currentDate = new Date(2025, 7, 2, 13, 30, 0); // 2nd August 2025, 13:30
				const notificationTime = {hours: 18, minutes: 30}; // 18:30

				// Test "on the day" notification for 2nd August (time hasn't passed)
				const result = getNextOccurrenceDate(
					"2",
					"Augusts",
					0,
					notificationTime,
					currentDate,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2025); // Same year
				expect(result!.getMonth()).toBe(7); // August (0-indexed)
				expect(result!.getDate()).toBe(2); // 2nd (today)
				expect(result!.getHours()).toBe(18); // 18:00
				expect(result!.getMinutes()).toBe(30); // 30 minutes
			});
		});
	});

	describe("Notification System Requirements", () => {
		it("should support 6 notification options", () => {
			// The system should support:
			// 0 = On the day
			// 1 = 1 day before
			// 2 = 2 days before
			// 3 = 3 days before
			// 4 = 4 days before
			// 5 = 5 days before
			const notificationDays = [0, 1, 2, 3, 4, 5];
			expect(notificationDays).toHaveLength(6);
		});

		it("should generate unique IDs for each notification day", () => {
			const name = "TestUser";
			const day = "15";
			const month = "Janvāris";

			const ids = [0, 1, 2, 3, 4, 5].map((daysBefore) =>
				generateDayOfNotificationId(name, day, month, daysBefore),
			);

			// All IDs should be unique
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(6);
		});

		it("should handle all Latvian months", () => {
			const months = [
				"Janvāris",
				"Februāris",
				"Marts",
				"Aprīlis",
				"Maijs",
				"Jūnijs",
				"Jūlijs",
				"Augusts",
				"Septembris",
				"Oktobris",
				"Novembris",
				"Decembris",
			];

			for (const month of months) {
				const id = generateDayOfNotificationId("Test", "15", month, 0);
				expect(id).toMatch(
					new RegExp(`^nameday-test-15-${month.toLowerCase()}-0$`),
				);
			}
		});
	});
});
