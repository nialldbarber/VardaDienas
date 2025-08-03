import {language$} from "@/app/store/language";
import {notifications$} from "@/app/store/notifications";
import notifee, {
	TriggerType,
	type TriggerNotification,
} from "@notifee/react-native";
import * as Permissions from "react-native-permissions";

// Helper function to get translations without hooks
function getNotificationText(
	language: string,
	key: string,
	name: string,
	daysBefore = 0,
) {
	console.log(`###### GET NOTIFICATION TEXT CALLED ######`);
	console.log(
		`###### Input - Language: ${language}, Key: ${key}, Name: ${name}, DaysBefore: ${daysBefore} ######`,
	);

	const translations = {
		en: {
			today: {
				title: "🎉 Name day today!",
				body: `It's ${name}'s name day! Don't forget to say sveiciens!`,
			},
			tomorrow: {
				title: "🎉 Name day tomorrow!",
				body: `Tomorrow is ${name}'s name day!`,
			},
			future: {
				title: "🎉 Name day coming up!",
				body: `${name}'s name day is in ${daysBefore} days!`,
			},
		},
		lv: {
			today: {
				title: "🎉 Vārda diena šodien!",
				body: `${name} svin vārda dienu šodien! Neaizmirsti teikt sveiciens!`,
			},
			tomorrow: {
				title: "🎉 Vārda diena rīt!",
				body: `Rīt ${name} svinēs vārda dienu!`,
			},
			future: {
				title: "🎉 Vārda diena drīzumā!",
				body: `${name} vārda diena būs pēc ${daysBefore} dienām!`,
			},
		},
	};

	const langTranslations =
		translations[language as keyof typeof translations] || translations.en;

	// Determine which message to use based on daysBefore
	console.log(`###### DECIDING WHICH MESSAGE TO USE ######`);
	console.log(
		`###### DaysBefore value: ${daysBefore}, Type: ${typeof daysBefore} ######`,
	);

	if (daysBefore === 0) {
		console.log(`###### SELECTED: TODAY MESSAGE ######`);
		return langTranslations.today;
	}
	if (daysBefore === 1) {
		console.log(`###### SELECTED: TOMORROW MESSAGE ######`);
		return langTranslations.tomorrow;
	}
	console.log(`###### SELECTED: FUTURE MESSAGE (${daysBefore} days) ######`);
	return langTranslations.future;
}

export async function requestNotificationPermissions(): Promise<boolean> {
	try {
		const {status} = await Permissions.requestNotifications([
			"alert",
			"sound",
			"badge",
		]);

		const hasPermission = status === Permissions.RESULTS.GRANTED;

		if (hasPermission) {
			language$.setNotificationPermissionStatus("granted");
			language$.setNotifications(true);
		} else {
			language$.setNotificationPermissionStatus("denied");
			language$.setNotifications(false);
		}

		return hasPermission;
	} catch (error) {
		console.error("Error requesting notification permissions:", error);
		language$.setNotificationPermissionStatus("denied");
		language$.setNotifications(false);
		return false;
	}
}

export async function checkNotificationPermissions(): Promise<boolean> {
	try {
		const {status} = await Permissions.checkNotifications();

		const hasPermission = status === Permissions.RESULTS.GRANTED;

		if (hasPermission) {
			language$.setNotificationPermissionStatus("granted");
		} else {
			language$.setNotificationPermissionStatus("denied");
		}

		return hasPermission;
	} catch (error) {
		console.error("Error checking notification permissions:", error);
		language$.setNotificationPermissionStatus("denied");
		return false;
	}
}

export async function scheduleNameDayNotifications(
	name: string,
	day: string,
	month: string,
	daysBefore: number | number[] = 0,
): Promise<void> {
	const currentLanguage = language$.currentLanguage.get();
	try {
		const hasPermission = await checkNotificationPermissions();
		if (!hasPermission) {
			console.warn("Cannot schedule notification: no permission");
			return;
		}

		const channelId = await notifee.createChannel({
			id: "nameday-notifications",
			name:
				currentLanguage === "lv"
					? "Vārda dienu paziņojumi"
					: "Name Day Notifications",
			description:
				currentLanguage === "lv"
					? "Paziņojumi par jūsu mīļākajām vārda dienām"
					: "Notifications for your favourite name days",
			sound: "default",
			vibration: true,
		});

		// Cancel existing notifications for this name first
		console.log(`###### CANCELLING EXISTING NOTIFICATIONS FOR ${name} ######`);
		await cancelNameDayNotifications(name, day, month);

		const daysArray = Array.isArray(daysBefore) ? daysBefore : [daysBefore];
		console.log("Scheduling notifications for days array:", daysArray);

		// Remove duplicates and sort to avoid conflicts
		const uniqueDays = [...new Set(daysArray)].sort((a, b) => b - a); // Sort descending
		console.log("Unique days after deduplication:", uniqueDays);

		// Track successful and failed notifications
		const successfulNotifications: number[] = [];
		const failedNotifications: number[] = [];

		for (const dayBefore of uniqueDays) {
			console.log(`Processing day ${dayBefore} for ${name}`);
			const nextDate = getNextOccurrenceDate(day, month, dayBefore);

			if (!nextDate) {
				console.warn(
					`Could not calculate next date for ${day} ${month} with ${dayBefore} days before`,
				);
				failedNotifications.push(dayBefore);
				continue;
			}

			// Check if this notification would fire at the same time as another one
			const notificationTime = nextDate.getTime();
			const existingNotificationTime = successfulNotifications.find(
				(successfulDay) => {
					const existingDate = getNextOccurrenceDate(day, month, successfulDay);
					return existingDate && existingDate.getTime() === notificationTime;
				},
			);

			if (existingNotificationTime !== undefined) {
				console.warn(
					`Skipping notification for ${dayBefore} days before - would fire at same time as ${existingNotificationTime} days before notification`,
				);
				failedNotifications.push(dayBefore);
				continue;
			}

			const notificationId = generateDayOfNotificationId(
				name,
				day,
				month,
				dayBefore,
			);
			console.log(`###### NOTIFICATION SCHEDULING ######`);
			console.log(
				`###### Name: ${name}, Day: ${day}, Month: ${month}, DaysBefore: ${dayBefore} ######`,
			);
			console.log(`###### Language: ${currentLanguage} ######`);

			const notificationText = getNotificationText(
				currentLanguage,
				"nameDayToday",
				name,
				dayBefore,
			);

			console.log(`###### NOTIFICATION TEXT RESULT ######`);
			console.log(`###### Title: ${notificationText.title} ######`);
			console.log(`###### Body: ${notificationText.body} ######`);

			try {
				console.log(
					`###### CREATING NOTIFICATION WITH ID: ${notificationId} ######`,
				);
				console.log(`###### NOTIFICATION OBJECT BEING CREATED ######`);
				console.log(`###### ID: ${notificationId} ######`);
				console.log(`###### TITLE: ${notificationText.title} ######`);
				console.log(`###### BODY: ${notificationText.body} ######`);

				const notificationObject = {
					id: notificationId,
					title: notificationText.title,
					body: notificationText.body,
					data: {
						deepLink: `vardadienas://favourites?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&month=${encodeURIComponent(month)}&daysBefore=${dayBefore}`,
						name,
						day,
						month,
						daysBefore: dayBefore.toString(),
					},
					android: {
						channelId,
						pressAction: {
							id: "default",
						},
						smallIcon: "ic_launcher",
					},
					ios: {
						sound: "default",
					},
				};

				console.log(`###### FULL NOTIFICATION OBJECT ######`);
				console.log(JSON.stringify(notificationObject, null, 2));

				await notifee.createTriggerNotification(notificationObject, {
					type: TriggerType.TIMESTAMP,
					timestamp: nextDate.getTime(),
					alarmManager: {
						allowWhileIdle: true,
					},
				});

				console.log(
					`Scheduled notification for ${name} on ${nextDate.toLocaleDateString()} at 9am (${dayBefore} days before name day)`,
				);
				successfulNotifications.push(dayBefore);
			} catch (error) {
				console.error(
					`Failed to schedule notification for ${name} (${dayBefore} days before):`,
					error,
				);
				failedNotifications.push(dayBefore);
			}
		}

		// Log summary
		if (successfulNotifications.length > 0) {
			console.log(
				`Successfully scheduled ${successfulNotifications.length} notifications for ${name}:`,
				successfulNotifications,
			);
		}
		if (failedNotifications.length > 0) {
			console.warn(
				`Failed to schedule ${failedNotifications.length} notifications for ${name}:`,
				failedNotifications,
			);
		}
	} catch (error) {
		console.error("Error scheduling notifications:", error);
	}
}

export async function cancelNameDayNotifications(
	name: string,
	day: string,
	month: string,
): Promise<void> {
	try {
		// Generate the name hash to match the new ID format
		const nameHash = name
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "")
			.substring(0, 8);

		// Cancel notifications for all possible days before (0-5)
		for (let daysBefore = 0; daysBefore <= 5; daysBefore++) {
			const notificationId = generateDayOfNotificationId(
				name,
				day,
				month,
				daysBefore,
			);

			try {
				await notifee.cancelNotification(notificationId);
				console.log(`Cancelled notification: ${notificationId}`);
			} catch (error) {
				// It's okay if the notification doesn't exist
				console.log(`Notification ${notificationId} was not found to cancel`);
			}
		}

		console.log(`Cancelled all notifications for ${name} (${day} ${month})`);
	} catch (error) {
		console.error("Error cancelling notifications:", error);
	}
}

export async function cancelAllNotifications(): Promise<void> {
	try {
		await notifee.cancelAllNotifications();
		console.log("Cancelled all notifications");
	} catch (error) {
		console.error("Error cancelling all notifications:", error);
	}
}

export async function cancelTestNotifications(): Promise<void> {
	try {
		const notifications = await notifee.getTriggerNotifications();
		const testNotifications = notifications.filter((notification) =>
			notification.notification.id?.startsWith("test-"),
		);

		for (const notification of testNotifications) {
			if (notification.notification.id) {
				await notifee.cancelNotification(notification.notification.id);
				console.log(
					`Cancelled test notification: ${notification.notification.id}`,
				);
			}
		}

		console.log(`Cancelled ${testNotifications.length} test notifications`);
	} catch (error) {
		console.error("Error cancelling test notifications:", error);
	}
}

function getNextOccurrenceDate(
	day: string,
	month: string,
	daysBefore = 0,
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

	const now = new Date();
	const currentYear = now.getFullYear();

	// Get the custom notification time from the store
	const notificationTime = notifications$.notificationTime.get();

	// For "today" notifications (daysBefore = 0), schedule for today at the specified time
	if (daysBefore === 0) {
		const today = new Date();
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

export function generateDayOfNotificationId(
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

export async function getScheduledNotifications(): Promise<
	TriggerNotification[]
> {
	try {
		const notifications = await notifee.getTriggerNotifications();
		console.log("Scheduled notifications:", notifications);
		return notifications;
	} catch (error) {
		console.error("Error getting scheduled notifications:", error);
		return [];
	}
}

export async function debugNotificationSetup(
	name: string,
	day: string,
	month: string,
): Promise<void> {
	console.log("=== NOTIFICATION DEBUG ===");

	const hasPermission = await checkNotificationPermissions();
	console.log("Has permission:", hasPermission);

	const nextDate = getNextOccurrenceDate(day, month);
	console.log("Next occurrence date:", nextDate);
	console.log("Current date:", new Date());

	if (nextDate) {
		const timeUntil = nextDate.getTime() - Date.now();
		console.log("Time until notification (ms):", timeUntil);
		console.log(
			"Time until notification (days):",
			timeUntil / (1000 * 60 * 60 * 24),
		);
	}

	const scheduled = await getScheduledNotifications();
	// Use the name hash to filter notifications for this specific person
	const nameHash = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "")
		.substring(0, 8);
	const nameNotifications = scheduled.filter((n) =>
		n.notification.id?.includes(nameHash),
	);
	console.log("Existing notifications for this name:", nameNotifications);
}

export async function debugNotificationTiming(
	name: string,
	day: string,
	month: string,
	daysBefore: number[],
): Promise<void> {
	console.log("=== NOTIFICATION TIMING DEBUG ===");
	console.log(`Name: ${name}, Day: ${day}, Month: ${month}`);
	console.log(`Selected days: ${daysBefore.join(", ")}`);

	const now = new Date();
	console.log(`Current time: ${now.toLocaleString()}`);

	for (const dayBefore of daysBefore) {
		const notificationDate = getNextOccurrenceDate(day, month, dayBefore);
		if (notificationDate) {
			const timeUntil = notificationDate.getTime() - now.getTime();
			const daysUntil = timeUntil / (1000 * 60 * 60 * 24);

			console.log(
				`\nDay ${dayBefore} (${dayBefore === 0 ? "On the day" : `${dayBefore} days before`}):`,
			);
			console.log(
				`  Notification will fire: ${notificationDate.toLocaleString()}`,
			);
			console.log(`  Time until notification: ${daysUntil.toFixed(2)} days`);
			console.log(
				`  Notification ID: ${generateDayOfNotificationId(name, day, month, dayBefore)}`,
			);
		} else {
			console.log(`\nDay ${dayBefore}: Could not calculate notification date`);
		}
	}

	// Check existing scheduled notifications
	const scheduled = await getScheduledNotifications();
	// Use the name hash to filter notifications for this specific person
	const nameHash = name
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "")
		.substring(0, 8);
	const nameNotifications = scheduled.filter((n) =>
		n.notification.id?.includes(nameHash),
	);
	console.log(
		`\nCurrently scheduled notifications for ${name}:`,
		nameNotifications.length,
	);
	nameNotifications.forEach((notification, index) => {
		console.log(`  ${index + 1}. ID: ${notification.notification.id}`);
		console.log(`     Trigger: ${notification.trigger}`);
	});
}

export async function testDeepLink(url: string): Promise<void> {
	console.log("Testing deep link:", url);

	// Import and handle the deep link
	const {handleDeepLink} = await import("@/app/navigation/deepLinking");
	handleDeepLink(url);
}

export async function testNotificationNavigation(
	name = "Test Name",
): Promise<void> {
	console.log("Testing notification navigation for:", name);

	// Create a test deep link
	const deepLink = `vardadienas://favourites?name=${encodeURIComponent(name)}&day=15&month=Janvāris&daysBefore=0`;

	// Import and handle the deep link
	const {handleDeepLink} = await import("@/app/navigation/deepLinking");
	handleDeepLink(deepLink);
}

export async function simulatePushNotification(
	name = "Test Name",
	day = "15",
	month = "Janvāris",
	daysBefore = 0,
): Promise<void> {
	console.log("=== SCHEDULING TEST PUSH NOTIFICATION ===");
	console.log(
		`Name: ${name}, Day: ${day}, Month: ${month}, Days Before: ${daysBefore}`,
	);

	try {
		const hasPermission = await checkNotificationPermissions();
		if (!hasPermission) {
			console.warn("Cannot schedule test notification: no permission");
			return;
		}

		const currentLanguage = language$.currentLanguage.get();
		const notificationText = getNotificationText(
			currentLanguage,
			"nameDayToday",
			name,
			daysBefore,
		);

		const channelId = await notifee.createChannel({
			id: "nameday-notifications",
			name:
				currentLanguage === "lv"
					? "Vārda dienu paziņojumi"
					: "Name Day Notifications",
			description:
				currentLanguage === "lv"
					? "Paziņojumi par jūsu mīļākajām vārda dienām"
					: "Notifications for your favourite name days",
			sound: "default",
			vibration: true,
		});

		// Schedule notification for 1 minute in the future
		const testDate = new Date(Date.now() + 60000); // 1 minute from now
		const notificationId = `test-${generateDayOfNotificationId(name, day, month, daysBefore)}`;

		await notifee.createTriggerNotification(
			{
				id: notificationId,
				title: `🧪 TEST: ${notificationText.title}`,
				body: `🧪 TEST: ${notificationText.body}`,
				data: {
					deepLink: `vardadienas://favourites?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&month=${encodeURIComponent(month)}&daysBefore=${daysBefore}`,
					name,
					day,
					month,
					daysBefore: daysBefore.toString(),
					isTest: "true",
				},
				android: {
					channelId,
					pressAction: {
						id: "default",
					},
					smallIcon: "ic_launcher",
				},
				ios: {
					sound: "default",
				},
			},
			{
				type: TriggerType.TIMESTAMP,
				timestamp: testDate.getTime(),
				alarmManager: {
					allowWhileIdle: true,
				},
			},
		);

		console.log(
			`✅ Test notification scheduled for ${testDate.toLocaleString()}`,
		);
		console.log(`Notification ID: ${notificationId}`);
		console.log(
			"The notification will fire in 1 minute and navigate to the Favourites screen.",
		);
	} catch (error) {
		console.error("❌ Error scheduling test notification:", error);
	}
}

export async function simulateMultiplePushNotifications(
	names: Array<{name: string; day: string; month: string; daysBefore: number}>,
): Promise<void> {
	console.log("=== SCHEDULING MULTIPLE TEST PUSH NOTIFICATIONS ===");
	console.log(`Scheduling ${names.length} test notifications...`);

	try {
		const hasPermission = await checkNotificationPermissions();
		if (!hasPermission) {
			console.warn("Cannot schedule test notifications: no permission");
			return;
		}

		const currentLanguage = language$.currentLanguage.get();
		const channelId = await notifee.createChannel({
			id: "nameday-notifications",
			name:
				currentLanguage === "lv"
					? "Vārda dienu paziņojumi"
					: "Name Day Notifications",
			description:
				currentLanguage === "lv"
					? "Paziņojumi par jūsu mīļākajām vārda dienām"
					: "Notifications for your favourite name days",
			sound: "default",
			vibration: true,
		});

		// Schedule notifications with 30-second intervals starting from 1 minute
		for (let i = 0; i < names.length; i++) {
			const {name, day, month, daysBefore} = names[i];
			console.log(
				`\n--- Scheduling Test Notification ${i + 1}/${names.length} ---`,
			);

			const notificationText = getNotificationText(
				currentLanguage,
				"nameDayToday",
				name,
				daysBefore,
			);

			// Schedule notification with staggered timing (1 min, 1.5 min, 2 min, etc.)
			const testDate = new Date(Date.now() + 60000 + i * 30000); // 1 min + (i * 30 seconds)
			const notificationId = `test-${generateDayOfNotificationId(name, day, month, daysBefore)}`;

			await notifee.createTriggerNotification(
				{
					id: notificationId,
					title: `🧪 TEST ${i + 1}: ${notificationText.title}`,
					body: `🧪 TEST ${i + 1}: ${notificationText.body}`,
					data: {
						deepLink: `vardadienas://favourites?name=${encodeURIComponent(name)}&day=${encodeURIComponent(day)}&month=${encodeURIComponent(month)}&daysBefore=${daysBefore}`,
						name,
						day,
						month,
						daysBefore: daysBefore.toString(),
						isTest: "true",
						testIndex: (i + 1).toString(),
					},
					android: {
						channelId,
						pressAction: {
							id: "default",
						},
						smallIcon: "ic_launcher",
					},
					ios: {
						sound: "default",
					},
				},
				{
					type: TriggerType.TIMESTAMP,
					timestamp: testDate.getTime(),
					alarmManager: {
						allowWhileIdle: true,
					},
				},
			);

			console.log(
				`✅ Test notification ${i + 1} scheduled for ${testDate.toLocaleString()}`,
			);
			console.log(`Notification ID: ${notificationId}`);
		}

		console.log("\n✅ All test notifications scheduled!");
		console.log(
			"Notifications will fire at 30-second intervals starting in 1 minute.",
		);
	} catch (error) {
		console.error("❌ Error scheduling multiple test notifications:", error);
	}
}

export async function testNotificationPermissions(): Promise<void> {
	console.log("=== TESTING NOTIFICATION PERMISSIONS ===");

	try {
		// Test the permission check
		const hasPermission = await checkNotificationPermissions();
		console.log("✅ Permission check result:", hasPermission);

		// Test requesting permissions
		const requestedPermission = await requestNotificationPermissions();
		console.log("✅ Permission request result:", requestedPermission);

		// Test scheduling a simple notification
		if (hasPermission) {
			console.log("✅ Scheduling test notification...");
			await simulatePushNotification("Test User", "15", "Janvāris", 0);
			console.log("✅ Test notification scheduled successfully!");
		} else {
			console.log("❌ No permission to schedule notifications");
		}
	} catch (error) {
		console.error("❌ Error testing notification permissions:", error);
	}
}

export async function debugScheduleForToday(): Promise<{
	success: boolean;
	message: string;
	details: string;
}> {
	console.log("=== DEBUG SCHEDULING FOR TODAY ===");

	try {
		const hasPermission = await checkNotificationPermissions();
		if (!hasPermission) {
			const message = "❌ No notification permission";
			console.log(message);
			return {
				success: false,
				message: "Failed to schedule notification",
				details: "No notification permission granted",
			};
		}

		const now = new Date();
		const notificationTime = notifications$.notificationTime.get();

		console.log("Current time:", now.toLocaleString());
		console.log("Notification time setting:", notificationTime);

		// Calculate when the notification should fire today
		const today = new Date();
		today.setHours(notificationTime.hours, notificationTime.minutes, 0, 0);

		console.log("Notification should fire at:", today.toLocaleString());

		// If the time has already passed today, schedule for tomorrow
		if (today <= now) {
			today.setDate(today.getDate() + 1);
			console.log(
				"Time already passed, scheduling for tomorrow:",
				today.toLocaleString(),
			);
		}

		const timeUntil = today.getTime() - now.getTime();
		const minutesUntil = timeUntil / (1000 * 60);
		console.log("Time until notification (ms):", timeUntil);
		console.log("Time until notification (minutes):", minutesUntil);

		const currentLanguage = language$.currentLanguage.get();
		const notificationText = getNotificationText(
			currentLanguage,
			"nameDayToday",
			"Debug Test",
			0,
		);

		const channelId = await notifee.createChannel({
			id: "nameday-notifications",
			name:
				currentLanguage === "lv"
					? "Vārda dienu paziņojumi"
					: "Name Day Notifications",
			description:
				currentLanguage === "lv"
					? "Paziņojumi par jūsu mīļākajām vārda dienām"
					: "Notifications for your favourite name days",
			sound: "default",
			vibration: true,
		});

		const notificationId = `debug-today-${Date.now()}`;

		await notifee.createTriggerNotification(
			{
				id: notificationId,
				title: `🔧 DEBUG: ${notificationText.title}`,
				body: `🔧 DEBUG: ${notificationText.body}`,
				data: {
					deepLink: `vardadienas://favourites?name=Debug%20Test&day=15&month=Janvāris&daysBefore=0`,
					name: "Debug Test",
					day: "15",
					month: "Janvāris",
					daysBefore: "0",
					isDebug: "true",
				},
				android: {
					channelId,
					pressAction: {
						id: "default",
					},
					smallIcon: "ic_launcher",
				},
				ios: {
					sound: "default",
				},
			},
			{
				type: TriggerType.TIMESTAMP,
				timestamp: today.getTime(),
				alarmManager: {
					allowWhileIdle: true,
				},
			},
		);

		console.log("✅ Debug notification scheduled!");
		console.log(`Notification ID: ${notificationId}`);
		console.log(`Will fire at: ${today.toLocaleString()}`);

		// Show scheduled notifications
		const scheduled = await getScheduledNotifications();
		const debugNotifications = scheduled.filter((n) =>
			n.notification.id?.startsWith("debug-"),
		);
		console.log("Debug notifications scheduled:", debugNotifications.length);

		return {
			success: true,
			message: "Debug notification scheduled successfully!",
			details: `Will fire at ${today.toLocaleString()} (in ${minutesUntil.toFixed(1)} minutes)`,
		};
	} catch (error) {
		console.error("❌ Error scheduling debug notification:", error);
		return {
			success: false,
			message: "Failed to schedule debug notification",
			details: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function debugShowAllScheduledNotifications(): Promise<{
	success: boolean;
	message: string;
	details: string;
}> {
	console.log("=== ALL SCHEDULED NOTIFICATIONS ===");

	try {
		const scheduled = await getScheduledNotifications();
		console.log(`Total scheduled notifications: ${scheduled.length}`);

		if (scheduled.length === 0) {
			console.log("No notifications scheduled");
			return {
				success: true,
				message: "No notifications scheduled",
				details: "There are currently no scheduled notifications",
			};
		}

		const now = new Date();
		console.log("Current time:", now.toLocaleString());

		let details = `Total: ${scheduled.length} notifications\nCurrent time: ${now.toLocaleString()}\n\n`;

		scheduled.forEach((notification, index) => {
			const trigger = notification.trigger;
			const notificationData = notification.notification;

			console.log(`\n--- Notification ${index + 1} ---`);
			console.log(`ID: ${notificationData.id}`);
			console.log(`Title: ${notificationData.title}`);
			console.log(`Body: ${notificationData.body}`);

			details += `${index + 1}. ${notificationData.title}\n`;

			if (trigger.type === TriggerType.TIMESTAMP) {
				const triggerDate = new Date(trigger.timestamp);
				const timeUntil = triggerDate.getTime() - now.getTime();
				const minutesUntil = timeUntil / (1000 * 60);

				console.log(`Trigger type: TIMESTAMP`);
				console.log(`Scheduled for: ${triggerDate.toLocaleString()}`);
				console.log(`Time until: ${minutesUntil.toFixed(2)} minutes`);
				console.log(`Is in past: ${triggerDate <= now}`);

				details += `   Scheduled: ${triggerDate.toLocaleString()}\n`;
				details += `   Time until: ${minutesUntil.toFixed(1)} minutes\n`;
				details += `   Past: ${triggerDate <= now ? "Yes" : "No"}\n`;
			} else {
				console.log(`Trigger type: ${trigger.type}`);
				details += `   Trigger: ${trigger.type}\n`;
			}

			if (notificationData.data) {
				console.log(`Data:`, notificationData.data);
			}

			details += "\n";
		});

		return {
			success: true,
			message: `Found ${scheduled.length} scheduled notifications`,
			details: details,
		};
	} catch (error) {
		console.error("❌ Error getting scheduled notifications:", error);
		return {
			success: false,
			message: "Failed to get scheduled notifications",
			details: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function debugCheckMMKVStorage(): Promise<{
	success: boolean;
	message: string;
	details: string;
}> {
	console.log("=== MMKV STORAGE DEBUG ===");

	try {
		// Import MMKV to check raw storage
		const {MMKV} = await import("react-native-mmkv");

		const favouritesStorage = new MMKV({
			id: "favourites-storage",
		});

		const notificationsStorage = new MMKV({
			id: "notifications-storage",
		});

		// Get all keys from both storages
		const favouritesKeys = favouritesStorage.getAllKeys();
		const notificationsKeys = notificationsStorage.getAllKeys();

		console.log("Favourites storage keys:", favouritesKeys);
		console.log("Notifications storage keys:", notificationsKeys);

		// Try to get the favourites data
		let favouritesData = null;
		try {
			favouritesData = favouritesStorage.getString("favourites");
		} catch (error) {
			console.log("Error reading favourites from MMKV:", error);
		}

		let notificationsData = null;
		try {
			notificationsData = notificationsStorage.getString("notificationTime");
		} catch (error) {
			console.log("Error reading notifications from MMKV:", error);
		}

		let details = `Favourites Storage:\n`;
		details += `  Keys: ${favouritesKeys.join(", ") || "None"}\n`;
		details += `  Data: ${favouritesData ? "Present" : "Missing"}\n`;
		details += `\nNotifications Storage:\n`;
		details += `  Keys: ${notificationsKeys.join(", ") || "None"}\n`;
		details += `  Data: ${notificationsData ? "Present" : "Missing"}\n`;

		if (favouritesData) {
			try {
				const parsed = JSON.parse(favouritesData);
				details += `\nFavourites count: ${parsed.length || 0}`;
			} catch (error) {
				details += `\nFavourites data: Invalid JSON`;
			}
		}

		return {
			success: true,
			message: "MMKV Storage Debug Complete",
			details: details,
		};
	} catch (error) {
		console.error("❌ Error checking MMKV storage:", error);
		return {
			success: false,
			message: "Failed to check MMKV storage",
			details: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function checkScheduledNotificationContent(): Promise<{
	success: boolean;
	message: string;
	details: string;
}> {
	console.log("=== CHECKING SCHEDULED NOTIFICATION CONTENT ===");

	try {
		const scheduled = await getScheduledNotifications();
		let details = `Found ${scheduled.length} scheduled notifications:\n\n`;

		scheduled.forEach((notification, index) => {
			const notificationData = notification.notification;
			details += `${index + 1}. ID: ${notificationData.id}\n`;
			details += `   Title: ${notificationData.title}\n`;
			details += `   Body: ${notificationData.body}\n`;
			details += `   Data: ${JSON.stringify(notificationData.data)}\n\n`;

			console.log(`Notification ${index + 1}:`);
			console.log(`  ID: ${notificationData.id}`);
			console.log(`  Title: ${notificationData.title}`);
			console.log(`  Body: ${notificationData.body}`);
			console.log(`  Data:`, notificationData.data);
		});

		return {
			success: true,
			message: `Found ${scheduled.length} scheduled notifications`,
			details: details,
		};
	} catch (error) {
		console.error("Error checking scheduled notifications:", error);
		return {
			success: false,
			message: "Failed to check scheduled notifications",
			details: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export function testNotificationTextLogic(): {
	success: boolean;
	message: string;
	details: string;
} {
	console.log("=== TESTING NOTIFICATION TEXT LOGIC ===");

	const testCases = [
		{daysBefore: 0, expected: "today"},
		{daysBefore: 1, expected: "tomorrow"},
		{daysBefore: 2, expected: "future"},
		{daysBefore: 3, expected: "future"},
		{daysBefore: 5, expected: "future"},
	];

	let details = "Testing notification text logic:\n\n";

	for (const testCase of testCases) {
		const enResult = getNotificationText(
			"en",
			"test",
			"John",
			testCase.daysBefore,
		);
		const lvResult = getNotificationText(
			"lv",
			"test",
			"Jānis",
			testCase.daysBefore,
		);

		details += `Days before: ${testCase.daysBefore}\n`;
		details += `  EN Title: ${enResult.title}\n`;
		details += `  EN Body: ${enResult.body}\n`;
		details += `  LV Title: ${lvResult.title}\n`;
		details += `  LV Body: ${lvResult.body}\n\n`;

		console.log(`Days before ${testCase.daysBefore}:`);
		console.log(`  EN: ${enResult.title} - ${enResult.body}`);
		console.log(`  LV: ${lvResult.title} - ${lvResult.body}`);
	}

	return {
		success: true,
		message: "Notification text logic test complete",
		details: details,
	};
}

export async function recoverFavouritesFromStorage(): Promise<{
	success: boolean;
	message: string;
	details: string;
}> {
	console.log("=== ATTEMPTING FAVOURITES RECOVERY ===");

	try {
		// Import MMKV and favourites store
		const {MMKV} = await import("react-native-mmkv");
		const {favourites$} = await import("@/app/store/favourites");

		const favouritesStorage = new MMKV({
			id: "favourites-storage",
		});

		// Try to get the raw favourites data
		const favouritesData = favouritesStorage.getString("favourites");

		if (!favouritesData) {
			return {
				success: false,
				message: "No favourites data found in storage",
				details: "The MMKV storage appears to be empty",
			};
		}

		try {
			const parsedFavourites = JSON.parse(favouritesData);

			if (!Array.isArray(parsedFavourites)) {
				return {
					success: false,
					message: "Invalid favourites data format",
					details: "The stored data is not an array",
				};
			}

			// Restore the favourites to the store
			favourites$.favourites.set(parsedFavourites);

			return {
				success: true,
				message: `Recovered ${parsedFavourites.length} favourites!`,
				details: `Successfully restored favourites from storage. Please restart the app to see them.`,
			};
		} catch (parseError) {
			return {
				success: false,
				message: "Failed to parse favourites data",
				details: `JSON parse error: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
			};
		}
	} catch (error) {
		console.error("❌ Error recovering favourites:", error);
		return {
			success: false,
			message: "Failed to recover favourites",
			details: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
