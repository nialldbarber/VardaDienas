import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

// Create a global MMKV instance
export const globalStorage = new MMKV({
	id: "global-storage",
});

// Configure global synced options with MMKV
export const globalSynced = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: globalStorage,
	},
});
