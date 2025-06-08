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
};

type FavouritesStore = {
	favourites: Favourite[];
	addFavourite: (favourite: Favourite) => void;
	removeFavourite: (name: string) => void;
	toggleNotification: (name: string, enabled: boolean) => void;
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
			favourites$.favourites.set(
				favourites$.favourites.get().filter((fav) => fav.name !== name),
			);
		} catch (error) {
			console.error("Failed to remove from favourites!", error);
			throw new Error("Failed to remove from favourites!");
		}
	},
	toggleNotification: (name: string, enabled: boolean) => {
		const favourites = favourites$.favourites.get();
		const updatedFavourites = favourites.map((fav) =>
			fav.name === name ? {...fav, notifyMe: enabled} : fav,
		);
		favourites$.favourites.set(updatedFavourites);
	},
});
