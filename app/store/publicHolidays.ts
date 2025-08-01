import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const publicHolidaysStorage = new MMKV({
	id: "public-holidays-storage",
});

const syncedPublicHolidays = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: publicHolidaysStorage,
	},
});

export const publicHolidays$ = observable({
	show: syncedPublicHolidays({
		initial: {
			show: true,
		},
		persist: {
			name: "show",
		},
	}),
	setShow: (value: boolean) => {
		publicHolidays$.show.set({show: value});
	},
});
