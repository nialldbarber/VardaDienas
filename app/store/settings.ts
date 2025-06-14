import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const settingsStorage = new MMKV({
	id: "settings-storage",
});

const syncedSettings = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: settingsStorage,
	},
});

export const settings$ = observable({
	haptics: syncedSettings({
		initial: true,
		persist: {
			name: "haptics",
		},
	}),
	setHaptics: (value: boolean) => settings$.haptics.set(value),
	notifications: syncedSettings({
		initial: false,
		persist: {
			name: "notifications",
		},
	}),
	notificationPermissionStatus: syncedSettings({
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
});
