import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const languageStorage = new MMKV({
	id: "language-storage",
});

const syncedLanguage = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: languageStorage,
	},
});

export type Language = "en" | "lv";

export const language$ = observable({
	currentLanguage: syncedLanguage({
		initial: "lv" as Language,
		persist: {
			name: "currentLanguage",
		},
	}),
	notifications: syncedLanguage({
		initial: false,
		persist: {
			name: "notifications",
		},
	}),
	notificationPermissionStatus: syncedLanguage({
		initial: "unavailable" as
			| "granted"
			| "denied"
			| "blocked"
			| "limited"
			| "unavailable",
		persist: {
			name: "notificationPermissionStatus",
		},
	}),
	setLanguage: (lang: Language) => {
		language$.currentLanguage.set(lang);
	},
	setNotifications: (value: boolean) => {
		language$.notifications.set(value);
	},
	setNotificationPermissionStatus: (
		status: "granted" | "denied" | "blocked" | "limited" | "unavailable",
	) => {
		language$.notificationPermissionStatus.set(status);
	},
});
