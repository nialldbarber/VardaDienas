// Test the notification scheduling logic
// We need to mock the notifications store and other dependencies

// Mock the notifications store
const mockNotificationTime = {hours: 9, minutes: 0};
const mockNotificationsStore = {
	notificationTime: {
		get: jest.fn(() => mockNotificationTime),
	},
};

// Mock the language store
const mockLanguageStore = {
	currentLanguage: {
		get: jest.fn(() => "en"),
	},
};

// Mock notifee
const mockNotifee = {
	createChannel: jest.fn(),
	createTriggerNotification: jest.fn(),
	cancelNotification: jest.fn(),
	getTriggerNotifications: jest.fn(),
	cancelAllNotifications: jest.fn(),
};

// Mock react-native-permissions
const mockPermissions = {
	checkNotifications: jest.fn(),
	requestNotifications: jest.fn(),
	RESULTS: {
		GRANTED: "granted",
		DENIED: "denied",
	},
};

// Mock the stores
jest.mock("@/app/store/notifications", () => ({
	notifications$: mockNotificationsStore,
}));

jest.mock("@/app/store/language", () => ({
	language$: mockLanguageStore,
}));

jest.mock("@notifee/react-native", () => mockNotifee);

jest.mock("react-native-permissions", () => mockPermissions);

// Import the function we want to test
// We need to import the actual function, but we'll need to mock its dependencies
import {scheduleNameDayNotifications} from "@/app/utils/notifications";

// Helper function to test the date calculation logic
function testGetNextOccurrenceDate(
	day: string,
	month: string,
	daysBefore: number,
	currentDate: Date,
	notificationTime: {hours: number; minutes: number},
): Date | null {
	// This is a simplified version of the logic from getNextOccurrenceDate
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
		return null;
	}

	const dayNumber = Number.parseInt(day.replace(/\D/g, ""), 10);
	if (Number.isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
		return null;
	}

	const now = currentDate;
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
		return null;
	}

	return notificationDate;
}

describe("Notification Scheduling Logic", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockNotificationsStore.notificationTime.get.mockReturnValue({
			hours: 9,
			minutes: 0,
		});
		mockLanguageStore.currentLanguage.get.mockReturnValue("en");
		mockPermissions.checkNotifications.mockResolvedValue({status: "granted"});
		mockNotifee.createChannel.mockResolvedValue("test-channel");
		mockNotifee.createTriggerNotification.mockResolvedValue(undefined);
		mockNotifee.getTriggerNotifications.mockResolvedValue([]);
	});

	describe("getNextOccurrenceDate Logic", () => {
		describe("Today Notifications (daysBefore = 0)", () => {
			it("should schedule for today at the specified time when time hasn't passed", () => {
				// Current time: 8:00 AM
				const currentDate = new Date(2024, 2, 15, 8, 0, 0); // March 15, 8:00 AM
				const notificationTime = {hours: 9, minutes: 0}; // 9:00 AM

				const result = testGetNextOccurrenceDate(
					"15",
					"Marts",
					0,
					currentDate,
					notificationTime,
				);

				expect(result).not.toBeNull();
				if (result) {
					expect(result.getFullYear()).toBe(2024);
					expect(result.getMonth()).toBe(2); // March
					expect(result.getDate()).toBe(15);
					expect(result.getHours()).toBe(9);
					expect(result.getMinutes()).toBe(0);
				}
			});

			it("should schedule for tomorrow when the time has already passed today", () => {
				// Current time: 10:00 AM
				const currentDate = new Date(2024, 2, 15, 10, 0, 0); // March 15, 10:00 AM
				const notificationTime = {hours: 9, minutes: 0}; // 9:00 AM

				const result = testGetNextOccurrenceDate(
					"15",
					"Marts",
					0,
					currentDate,
					notificationTime,
				);

				expect(result).not.toBeNull();
				if (result) {
					expect(result.getFullYear()).toBe(2024);
					expect(result.getMonth()).toBe(2); // March
					expect(result.getDate()).toBe(16); // Tomorrow
					expect(result.getHours()).toBe(9);
					expect(result.getMinutes()).toBe(0);
				}
			});

			it("should work with custom notification times", () => {
				// Current time: 2:00 PM
				const currentDate = new Date(2024, 2, 15, 14, 0, 0); // March 15, 2:00 PM
				const notificationTime = {hours: 15, minutes: 30}; // 3:30 PM

				const result = testGetNextOccurrenceDate(
					"15",
					"Marts",
					0,
					currentDate,
					notificationTime,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2024);
				expect(result!.getMonth()).toBe(2); // March
				expect(result!.getDate()).toBe(15); // Today
				expect(result!.getHours()).toBe(15);
				expect(result!.getMinutes()).toBe(30);
			});
		});

		describe("Days Before Notifications (daysBefore > 0)", () => {
			it("should calculate correct date for 1 day before", () => {
				// Current time: March 10, 8:00 AM
				const currentDate = new Date(2024, 2, 10, 8, 0, 0);
				const notificationTime = {hours: 9, minutes: 0};

				// Name day is March 15, want notification 1 day before
				const result = testGetNextOccurrenceDate(
					"15",
					"Marts",
					1,
					currentDate,
					notificationTime,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2024);
				expect(result!.getMonth()).toBe(2); // March
				expect(result!.getDate()).toBe(14); // March 14 (1 day before March 15)
				expect(result!.getHours()).toBe(9);
				expect(result!.getMinutes()).toBe(0);
			});

			it("should calculate correct date for 5 days before", () => {
				// Current time: March 5, 8:00 AM
				const currentDate = new Date(2024, 2, 5, 8, 0, 0);
				const notificationTime = {hours: 9, minutes: 0};

				// Name day is March 15, want notification 5 days before
				const result = testGetNextOccurrenceDate(
					"15",
					"Marts",
					5,
					currentDate,
					notificationTime,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2024);
				expect(result!.getMonth()).toBe(2); // March
				expect(result!.getDate()).toBe(10); // March 10 (5 days before March 15)
				expect(result!.getHours()).toBe(9);
				expect(result!.getMinutes()).toBe(0);
			});

			it("should schedule for next year if name day has passed this year", () => {
				// Current time: December 20, 8:00 AM
				const currentDate = new Date(2024, 11, 20, 8, 0, 0);
				const notificationTime = {hours: 9, minutes: 0};

				// Name day is January 15, want notification 1 day before
				const result = testGetNextOccurrenceDate(
					"15",
					"Janvāris",
					1,
					currentDate,
					notificationTime,
				);

				expect(result).not.toBeNull();
				expect(result!.getFullYear()).toBe(2025); // Next year
				expect(result!.getMonth()).toBe(0); // January
				expect(result!.getDate()).toBe(14); // January 14 (1 day before January 15)
				expect(result!.getHours()).toBe(9);
				expect(result!.getMinutes()).toBe(0);
			});
		});

		describe("Edge Cases", () => {
			it("should return null for invalid month", () => {
				const currentDate = new Date(2024, 2, 15, 8, 0, 0);
				const notificationTime = {hours: 9, minutes: 0};

				const result = testGetNextOccurrenceDate(
					"15",
					"InvalidMonth",
					0,
					currentDate,
					notificationTime,
				);

				expect(result).toBeNull();
			});

			it("should return null for invalid day", () => {
				const currentDate = new Date(2024, 2, 15, 8, 0, 0);
				const notificationTime = {hours: 9, minutes: 0};

				const result = testGetNextOccurrenceDate(
					"32",
					"Marts",
					0,
					currentDate,
					notificationTime,
				);

				expect(result).toBeNull();
			});

			it("should return null when notification would be in the past", () => {
				// Current time: March 20, 10:00 AM
				const currentDate = new Date(2024, 2, 20, 10, 0, 0);
				const notificationTime = {hours: 9, minutes: 0};

				// Name day is March 15, want notification 1 day before (March 14)
				// But March 14 has already passed
				const result = testGetNextOccurrenceDate(
					"15",
					"Marts",
					1,
					currentDate,
					notificationTime,
				);

				expect(result).toBeNull();
			});
		});
	});

	describe("Notification Scheduling Integration", () => {
		it("should schedule today notifications correctly", async () => {
			// Mock current time
			const mockDate = new Date(2024, 2, 15, 8, 0, 0); // March 15, 8:00 AM
			jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

			await scheduleNameDayNotifications("Test Name", "15", "Marts", 0);

			expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					id: expect.stringContaining("nameday-testname-15-marts-0"),
					title: expect.stringContaining("Name day today!"),
				}),
				expect.objectContaining({
					type: expect.any(Number), // TriggerType.TIMESTAMP
					timestamp: expect.any(Number),
				}),
			);

			// Verify the timestamp is for today at 9:00 AM
			const callArgs = mockNotifee.createTriggerNotification.mock.calls[0];
			const trigger = callArgs[1];
			const scheduledDate = new Date(trigger.timestamp);

			expect(scheduledDate.getFullYear()).toBe(2024);
			expect(scheduledDate.getMonth()).toBe(2); // March
			expect(scheduledDate.getDate()).toBe(15);
			expect(scheduledDate.getHours()).toBe(9);
			expect(scheduledDate.getMinutes()).toBe(0);

			jest.restoreAllMocks();
		});

		it("should schedule days-before notifications correctly", async () => {
			// Mock current time
			const mockDate = new Date(2024, 2, 10, 8, 0, 0); // March 10, 8:00 AM
			jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

			await scheduleNameDayNotifications("Test Name", "15", "Marts", 1);

			expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
				expect.objectContaining({
					id: expect.stringContaining("nameday-testname-15-marts-1"),
					title: expect.stringContaining("Name day tomorrow!"),
				}),
				expect.objectContaining({
					type: expect.any(Number), // TriggerType.TIMESTAMP
					timestamp: expect.any(Number),
				}),
			);

			// Verify the timestamp is for March 14 at 9:00 AM (1 day before March 15)
			const callArgs = mockNotifee.createTriggerNotification.mock.calls[0];
			const trigger = callArgs[1];
			const scheduledDate = new Date(trigger.timestamp);

			expect(scheduledDate.getFullYear()).toBe(2024);
			expect(scheduledDate.getMonth()).toBe(2); // March
			expect(scheduledDate.getDate()).toBe(14); // March 14
			expect(scheduledDate.getHours()).toBe(9);
			expect(scheduledDate.getMinutes()).toBe(0);

			jest.restoreAllMocks();
		});
	});
});
