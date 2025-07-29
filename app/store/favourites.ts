import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";
import {MMKV} from "react-native-mmkv";

const favouritesStorage = new MMKV({
	id: "favourites-storage",
});

export type Favourite = {
	name: string;
	day: string;
	month: string;
	notifyMe?: boolean;
	daysBefore?: number;
};

type FavouritesStore = {
	favourites: Favourite[];
	addFavourite: (favourite: Favourite) => void;
	removeFavourite: (name: string) => void;
	toggleNotification: (name: string, enabled: boolean) => void;
	setDaysBefore: (name: string, daysBefore: number) => void;
	toggleDaysBefore: (name: string, day: number) => void;
};

const syncedFavourites = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: favouritesStorage,
	},
});

// Check what's in storage on startup
console.log("Favourites storage keys:", favouritesStorage.getAllKeys());
console.log(
	"Favourites storage contains 'favourites':",
	favouritesStorage.contains("favourites"),
);

export const favourites$ = observable<FavouritesStore>({
	favourites: syncedFavourites({
		initial: [],
		persist: {
			name: "favourites",
		},
	}),
	addFavourite: (favourite: Favourite) => {
		console.log("Adding favourite:", favourite);
		favourites$.favourites.push(favourite);
		console.log(
			"Current favourites after adding:",
			favourites$.favourites.get(),
		);
	},
	removeFavourite: (name: string) => {
		try {
			console.log("Removing favourite:", name);
			const currentFavourites = favourites$.favourites.get();
			console.log("Current favourites before removing:", currentFavourites);
			const updatedFavourites = currentFavourites.filter(
				(fav) => fav.name !== name,
			);
			favourites$.favourites.set(updatedFavourites);
			console.log("Favourites after removing:", updatedFavourites);
		} catch (error) {
			console.error("Failed to remove from favourites!", error);
			throw new Error("Failed to remove from favourites!");
		}
	},
	toggleNotification: (name: string, enabled: boolean) => {
		const favourites = favourites$.favourites.get();
		const updatedFavourites = favourites.map((fav) => {
			if (fav.name === name) {
				// When enabling notifications, set default to "On the day" (0)
				// When disabling, clear the daysBefore
				return {
					...fav,
					notifyMe: enabled,
					daysBefore: enabled ? 0 : undefined,
				};
			}
			return fav;
		});
		favourites$.favourites.set(updatedFavourites);
	},
	setDaysBefore: (name: string, daysBefore: number) => {
		const favourites = favourites$.favourites.get();
		const updatedFavourites = favourites.map((fav) =>
			fav.name === name ? {...fav, daysBefore} : fav,
		);
		favourites$.favourites.set(updatedFavourites);
	},
	toggleDaysBefore: (name: string, day: number) => {
		const favourites = favourites$.favourites.get();
		console.log(
			"Toggling days before for:",
			name,
			"day:",
			day,
			"current favourites:",
			favourites,
		);
		const updatedFavourites = favourites.map((fav) => {
			if (fav.name === name) {
				// Simple toggle: if the day is already set, clear it; otherwise set it
				const newDaysBefore = fav.daysBefore === day ? undefined : day;
				console.log(
					"Updated days for",
					name,
					"from",
					fav.daysBefore,
					"to",
					newDaysBefore,
				);
				return {...fav, daysBefore: newDaysBefore};
			}
			return fav;
		});
		favourites$.favourites.set(updatedFavourites);
		console.log("Favourites after toggling:", updatedFavourites);
	},
});
