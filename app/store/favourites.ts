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
	daysBefore?: number[];
	isPublicHoliday?: boolean;
	emoji?: string;
	titleLv?: string;
};

type FavouritesStore = {
	favourites: Favourite[];
	addFavourite: (favourite: Favourite) => void;
	removeFavourite: (name: string) => void;
	toggleNotification: (name: string, enabled: boolean) => void;
	setDaysBefore: (name: string, daysBefore: number[]) => void;
	toggleDaysBefore: (name: string, day: number) => void;
};

const syncedFavourites = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
		mmkv: favouritesStorage,
	},
});

export const favourites$ = observable<FavouritesStore>({
	favourites: syncedFavourites({
		initial: [],
		persist: {
			name: "favourites",
		},
	}),
	addFavourite: (favourite: Favourite) => {
		favourites$.favourites.push(favourite);
	},
	removeFavourite: (name: string) => {
		try {
			const currentFavourites = favourites$.favourites.get();
			const updatedFavourites = currentFavourites.filter(
				(fav) => fav.name !== name,
			);
			favourites$.favourites.set(updatedFavourites);
		} catch (error) {
			console.error("Failed to remove from favourites!", error);
			throw new Error("Failed to remove from favourites!");
		}
	},
	toggleNotification: (name: string, enabled: boolean) => {
		const favourites = favourites$.favourites.get();
		const updatedFavourites = favourites.map((fav) => {
			if (fav.name === name) {
				return {
					...fav,
					notifyMe: enabled,
					daysBefore: enabled ? [0] : undefined,
				};
			}
			return fav;
		});
		favourites$.favourites.set(updatedFavourites);
	},
	setDaysBefore: (name: string, daysBefore: number[]) => {
		const favourites = favourites$.favourites.get();
		const updatedFavourites = favourites.map((fav) =>
			fav.name === name ? {...fav, daysBefore} : fav,
		);
		favourites$.favourites.set(updatedFavourites);
	},
	toggleDaysBefore: (name: string, day: number) => {
		const favourites = favourites$.favourites.get();
		const updatedFavourites = favourites.map((fav) => {
			if (fav.name === name) {
				const currentDays = fav.daysBefore || [];
				const isSelected = currentDays.includes(day);

				let newDaysBefore: number[];
				if (isSelected) {
					newDaysBefore = currentDays.filter((d) => d !== day);
				} else {
					newDaysBefore = [...currentDays, day];
				}

				return {...fav, daysBefore: newDaysBefore};
			}
			return fav;
		});
		favourites$.favourites.set(updatedFavourites);
	},
});
