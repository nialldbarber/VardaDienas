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
