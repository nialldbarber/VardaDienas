import notifee, {
	TriggerType,
	type TriggerNotification,
} from "@notifee/react-native";
import {PermissionsAndroid, Platform} from "react-native";

export async function requestNotificationPermissions(): Promise<boolean> {
	try {
		if (Platform.OS === "android") {
			if (Platform.Version >= 33) {
				const granted = await PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
				);
				return granted === PermissionsAndroid.RESULTS.GRANTED;
			}
			return true;
		}

		// iOS - use notifee for consistent permission handling
		const settings = await notifee.requestPermission();
		return settings.authorizationStatus >= 1;
	} catch (error) {
		console.error("Error requesting notification permissions:", error);
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
				return hasPermission;
			}
			return true;
		}

		// iOS
		const settings = await notifee.getNotificationSettings();
		return settings.authorizationStatus >= 1;
	} catch (error) {
		console.error("Error checking notification permissions:", error);
		return false;
	}
}

export async function scheduleNameDayNotifications(
	name: string,
	day: string,
	month: string,
): Promise<void> {
	try {
		// Check permissions first
		const hasPermission = await checkNotificationPermissions();
		if (!hasPermission) {
			console.warn("Cannot schedule notification: no permission");
			return;
		}

		const channelId = await notifee.createChannel({
			id: "nameday-notifications",
			name: "Name Day Notifications",
			description: "Notifications for your favourite name days",
			sound: "default",
			vibration: true,
		});

		const nextDate = getNextOccurrenceDate(day, month);

		if (!nextDate) {
			console.warn(`Could not calculate next date for ${day} ${month}`);
			return;
		}

		// Cancel any existing notifications for this name first
		await cancelNameDayNotifications(name, day, month);

		const dayOfId = generateDayOfNotificationId(name, day, month);
		await notifee.createTriggerNotification(
			{
				id: dayOfId,
				title: "🎉 Name Day Today!",
				body: `Today is ${name}'s name day (${day} ${month})`,
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

		const dayBeforeDate = new Date(nextDate);
		dayBeforeDate.setDate(dayBeforeDate.getDate() - 1);

		const dayBeforeId = generateDayBeforeNotificationId(name, day, month);
		await notifee.createTriggerNotification(
			{
				id: dayBeforeId,
				title: "🔔 Name Day Tomorrow!",
				body: `Tomorrow is ${name}'s name day (${day} ${month})`,
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
				timestamp: dayBeforeDate.getTime(),
				alarmManager: {
					allowWhileIdle: true,
				},
			},
		);

		console.log(
			`Scheduled notifications for ${name}: day before (${dayBeforeDate.toLocaleDateString()}) and day of (${nextDate.toLocaleDateString()})`,
		);
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
		const dayOfId = generateDayOfNotificationId(name, day, month);
		const dayBeforeId = generateDayBeforeNotificationId(name, day, month);

		await notifee.cancelNotification(dayOfId);
		await notifee.cancelNotification(dayBeforeId);

		console.log(`Cancelled notifications for ${name}`);
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

function getNextOccurrenceDate(day: string, month: string): Date | null {
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

	// Set notification time to 9 AM
	let targetDate = new Date(currentYear, monthIndex, dayNumber, 9, 0, 0);

	// If the date has already passed this year (including if it's today but after 9 AM),
	// schedule for next year
	if (targetDate <= now) {
		targetDate = new Date(currentYear + 1, monthIndex, dayNumber, 9, 0, 0);
	}

	// Additional validation: make sure the date is valid (handles Feb 29 on non-leap years, etc.)
	if (targetDate.getDate() !== dayNumber) {
		console.warn(
			`Invalid date: ${dayNumber} ${month} (adjusted to ${targetDate.getDate()})`,
		);
		return null;
	}

	return targetDate;
}

export function generateDayOfNotificationId(
	name: string,
	day: string,
	month: string,
): string {
	return `nameday-${name}-${day}-${month}`.replace(/\s+/g, "-").toLowerCase();
}

export function generateDayBeforeNotificationId(
	name: string,
	day: string,
	month: string,
): string {
	return `daybefore-nameday-${name}-${day}-${month}`
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

	// Check permissions
	const hasPermission = await checkNotificationPermissions();
	console.log("Has permission:", hasPermission);

	// Calculate next date
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

	// Check existing notifications
	const scheduled = await getScheduledNotifications();
	const nameNotifications = scheduled.filter((n) =>
		n.notification.id?.includes(name.toLowerCase().replace(/\s+/g, "-")),
	);
	console.log("Existing notifications for this name:", nameNotifications);

	console.log("=== END DEBUG ===");
}
