import {createNavigationContainerRef} from "@react-navigation/native";

export type RootStackParamList = {
	HomeStack: undefined;
	Favourites: {highlightName?: string} | undefined;
	SettingsStack: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToFavourites(highlightName?: string) {
	if (navigationRef.isReady()) {
		// Add a small delay to ensure the app is fully loaded
		setTimeout(() => {
			navigationRef.navigate(
				"Favourites",
				highlightName ? {highlightName} : undefined,
			);
		}, 100);
	}
}

export function navigateToHome() {
	if (navigationRef.isReady()) {
		navigationRef.navigate("HomeStack");
	}
}

export function navigateToSettings() {
	if (navigationRef.isReady()) {
		navigationRef.navigate("SettingsStack");
	}
}
