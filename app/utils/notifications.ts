import {language$} from "@/app/store/language";
import notifee, {
	TriggerType,
	type TriggerNotification,
} from "@notifee/react-native";
import {PermissionsAndroid, Platform} from "react-native";

// Helper function to get translations without hooks
function getNotificationText(
	language: string,
	key: string,
	name: string,
	daysBefore = 0,
) {
	const translations = {
		en: {
			today: {
				title: "🎉 Name day today!",
				body: `It's ${name}'s name day! Don't forget to say sveiciens!`,
			},
			tomorrow: {
				title: "🎉 Name day tomorrow!",
				body: `Tomorrow is ${name}'s name day! Don't forget to say sveiciens!`,
			},
			future: {
				title: "🎉 Name day coming up!",
				body: `${name}'s name day is in ${daysBefore} days! Don't forget to say sveiciens!`,
			},
		},
		lv: {
			today: {
				title: "🎉 Vārda diena šodien!",
				body: `Šodien ir ${name} vārda diena! Neaizmirsti teikt sveiciens!`,
			},
			tomorrow: {
				title: "🎉 Vārda diena rīt!",
				body: `Rīt ir ${name} vārda diena! Neaizmirsti teikt sveiciens!`,
			},
			future: {
				title: "🎉 Vārda diena drīzumā!",
				body: `${name} vārda diena ir pēc ${daysBefore} dienām! Neaizmirsti teikt sveiciens!`,
			},
		},
	};

	const langTranslations =
		translations[language as keyof typeof translations] || translations.en;

	// Determine which message to use based on daysBefore
	if (daysBefore === 0) {
		return langTranslations.today;
	}
	if (daysBefore === 1) {
		return langTranslations.tomorrow;
	}
	return langTranslations.future;
}

export async function requestNotificationPermissions(): Promise<boolean> {
	try {
		if (Platform.OS === "android") {
			if (Platform.Version >= 33) {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
				);
				const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;

				if (hasPermission) {
					language$.setNotificationPermissionStatus("granted");
					language$.setNotifications(true);
				} else {
					language$.setNotificationPermissionStatus("denied");
					language$.setNotifications(false);
				}

				return hasPermission;
			}
			language$.setNotificationPermissionStatus("granted");
			language$.setNotifications(true);
			return true;
		}

		const settings = await notifee.requestPermission();
		const hasPermission = settings.authorizationStatus >= 1;

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
		if (Platform.OS === "android") {
			if (Platform.Version >= 33) {
				const hasPermission = await PermissionsAndroid.check(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
				);

				if (hasPermission) {
					language$.setNotificationPermissionStatus("granted");
				} else {
					language$.setNotificationPermissionStatus("denied");
				}

				return hasPermission;
			}
			language$.setNotificationPermissionStatus("granted");
			return true;
		}

		const settings = await notifee.getNotificationSettings();
		const hasPermission = settings.authorizationStatus >= 1;

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
		await cancelNameDayNotifications(name, day, month);

		const daysArray = Array.isArray(daysBefore) ? daysBefore : [daysBefore];
		console.log("Scheduling notifications for days array:", daysArray);

		// Track successful and failed notifications
		const successfulNotifications: number[] = [];
		const failedNotifications: number[] = [];

		for (const dayBefore of daysArray) {
			console.log(`Processing day ${dayBefore} for ${name}`);
			const nextDate = getNextOccurrenceDate(day, month, dayBefore);

			if (!nextDate) {
				console.warn(
					`Could not calculate next date for ${day} ${month} with ${dayBefore} days before`,
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
			const notificationText = getNotificationText(
				currentLanguage,
				"nameDayToday",
				name,
				dayBefore,
			);

			try {
				await notifee.createTriggerNotification(
					{
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
					},
					{
						type: TriggerType.TIMESTAMP,
						timestamp: nextDate.getTime(),
						alarmManager: {
							allowWhileIdle: true,
						},
					},
				);

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

	// Create the target date for the name day
	let targetDate = new Date(currentYear, monthIndex, dayNumber, 9, 0, 0);

	// If the name day has already passed this year, schedule for next year
	if (targetDate <= now) {
		targetDate = new Date(currentYear + 1, monthIndex, dayNumber, 9, 0, 0);
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
