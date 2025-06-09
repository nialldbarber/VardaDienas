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
	setLanguage: (lang: Language) => {
		language$.currentLanguage.set(lang);
	},
});
