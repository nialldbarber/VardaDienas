import notifee, {TriggerType} from "@notifee/react-native";
import {PermissionsAndroid, Platform} from "react-native";

export async function requestNotificationPermissions(): Promise<boolean> {
	if (Platform.OS === "android") {
		if (Platform.Version >= 33) {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
			);
			return granted === PermissionsAndroid.RESULTS.GRANTED;
		}
		return true;
	}

	// iOS
	const settings = await notifee.requestPermission();
	return settings.authorizationStatus >= 1;
}

export async function scheduleNameDayNotifications(
	name: string,
	day: string,
	month: string,
): Promise<void> {
	try {
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

	let targetDate = new Date(currentYear, monthIndex, dayNumber, 9, 0, 0);

	if (targetDate <= now) {
		targetDate = new Date(currentYear + 1, monthIndex, dayNumber, 9, 0, 0);
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
