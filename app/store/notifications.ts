import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const notificationsStorage = new MMKV({
	id: "notifications-storage",
});

const syncedNotifications = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: notificationsStorage,
	},
});

export type NotificationTime = {
	hours: number;
	minutes: number;
};

export const notifications$ = observable({
	notificationTime: syncedNotifications({
		initial: {hours: 9, minutes: 0} as NotificationTime,
		persist: {
			name: "notificationTime",
		},
	}),
	migrationDone: syncedNotifications({
		initial: false,
		persist: {
			name: "notificationsMigrationV1",
		},
	}),
	setNotificationTime: (time: NotificationTime) => {
		notifications$.notificationTime.set(time);
	},
	setMigrationDone: (done: boolean) => {
		notifications$.migrationDone.set(done);
	},
});
