import {observable} from "@legendapp/state";
import {ObservablePersistMMKV} from "@legendapp/state/persist-plugins/mmkv";
import {configureSynced, synced} from "@legendapp/state/sync";

type Favourite = {
	name: string;
	day: string;
	month: string;
};

type FavouritesStore = {
	favourites: Favourite[];
	addFavourite: (favourite: Favourite) => void;
	removeFavourite: (favourite: Favourite) => void;
};

const syncedFavourites = configureSynced(synced, {
	persist: {
		plugin: ObservablePersistMMKV,
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
	removeFavourite: (favourite: Favourite) => {
		favourites$.favourites.set(
			favourites$.favourites.get().filter((fav) => fav.name !== favourite.name),
		);
	},
});
