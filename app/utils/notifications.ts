import {language$} from "@/app/store/language";
import {settings$} from "@/app/store/settings";
import notifee, {
	TriggerType,
	type TriggerNotification,
} from "@notifee/react-native";
import {PermissionsAndroid, Platform} from "react-native";

// Helper function to get translations without hooks
function getNotificationText(language: string, key: string, name: string) {
	const translations = {
		en: {
			title: "🎉 Name Day Today!",
			body: `It's ${name}'s name day! Don't forget to say sveiciens!`,
		},
		lv: {
			title: "🎉 Vārda diena šodien!",
			body: `Šodien ir ${name} vārda diena! Neaizmirsti teikt sveiciens!`,
		},
	};

	return translations[language as keyof typeof translations] || translations.en;
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
					settings$.notificationPermissionStatus.set("granted");
					settings$.notifications.set(true);
				} else {
					settings$.notificationPermissionStatus.set("denied");
					settings$.notifications.set(false);
				}

				return hasPermission;
			}
			settings$.notificationPermissionStatus.set("granted");
			settings$.notifications.set(true);
			return true;
		}

		const settings = await notifee.requestPermission();
		const hasPermission = settings.authorizationStatus >= 1;

		if (hasPermission) {
			settings$.notificationPermissionStatus.set("granted");
			settings$.notifications.set(true);
		} else {
			settings$.notificationPermissionStatus.set("denied");
			settings$.notifications.set(false);
		}

		return hasPermission;
	} catch (error) {
		console.error("Error requesting notification permissions:", error);
		settings$.notificationPermissionStatus.set("denied");
		settings$.notifications.set(false);
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
					settings$.notificationPermissionStatus.set("granted");
					settings$.notifications.set(true);
				} else {
					settings$.notificationPermissionStatus.set("denied");
					settings$.notifications.set(false);
				}

				return hasPermission;
			}
			settings$.notificationPermissionStatus.set("granted");
			settings$.notifications.set(true);
			return true;
		}

		const settings = await notifee.getNotificationSettings();
		const hasPermission = settings.authorizationStatus >= 1;

		if (hasPermission) {
			settings$.notificationPermissionStatus.set("granted");
			settings$.notifications.set(true);
		} else {
			settings$.notificationPermissionStatus.set("denied");
			settings$.notifications.set(false);
		}

		return hasPermission;
	} catch (error) {
		console.error("Error checking notification permissions:", error);
		settings$.notificationPermissionStatus.set("denied");
		settings$.notifications.set(false);
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

		await cancelNameDayNotifications(name, day, month);

		const daysArray = Array.isArray(daysBefore) ? daysBefore : [daysBefore];
		console.log("Scheduling notifications for days array:", daysArray);

		for (const dayBefore of daysArray) {
			console.log(`Processing day ${dayBefore} for ${name}`);
			const nextDate = getNextOccurrenceDate(day, month, dayBefore);

			if (!nextDate) {
				console.warn(
					`Could not calculate next date for ${day} ${month} with ${dayBefore} days before`,
				);
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
			);

			await notifee.createTriggerNotification(
				{
					id: notificationId,
					title: notificationText.title,
					body: notificationText.body,
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
		for (let daysBefore = 0; daysBefore <= 5; daysBefore++) {
			const notificationId = generateDayOfNotificationId(
				name,
				day,
				month,
				daysBefore,
			);
			await notifee.cancelNotification(notificationId);
		}

		console.log(`Cancelled all notifications for ${name}`);
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

	let targetDate = new Date(currentYear, monthIndex, dayNumber, 9, 0, 0);

	if (targetDate <= now) {
		targetDate = new Date(currentYear + 1, monthIndex, dayNumber, 9, 0, 0);
	}

	// Subtract the days before to get the notification date
	targetDate.setDate(targetDate.getDate() - daysBefore);

	// Don't validate the notification date against the name day date
	// since we intentionally subtracted days from it

	return targetDate;
}

export function generateDayOfNotificationId(
	name: string,
	day: string,
	month: string,
	daysBefore = 0,
): string {
	return `nameday-${name}-${day}-${month}-${daysBefore}`
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
	const nameNotifications = scheduled.filter((n) =>
		n.notification.id?.includes(name.toLowerCase().replace(/\s+/g, "-")),
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
	const nameNotifications = scheduled.filter((n) =>
		n.notification.id?.includes(name.toLowerCase().replace(/\s+/g, "-")),
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
