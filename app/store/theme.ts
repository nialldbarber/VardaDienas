import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const themeStorage = new MMKV({
	id: "theme-storage",
});

type ThemeStore = {
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
};

const syncedTheme = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: themeStorage,
	},
});

export const theme$ = observable<ThemeStore>({
	theme: syncedTheme({
		initial: "light",
		persist: {
			name: "theme",
		},
	}),
	setTheme: (theme: "light" | "dark") => {
		theme$.theme.set(theme);
	},
});
