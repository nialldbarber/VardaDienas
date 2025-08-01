import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const hapticsStorage = new MMKV({
	id: "haptics-storage",
});

const syncedHaptics = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: hapticsStorage,
	},
});

export const haptics$ = observable({
	enabled: syncedHaptics({
		initial: {
			enabled: true,
		},
		persist: {
			name: "enabled",
		},
	}),
	setEnabled: (value: boolean) => {
		haptics$.enabled.set({enabled: value});
	},
});
