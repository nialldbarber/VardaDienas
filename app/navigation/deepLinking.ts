import {Linking} from "react-native";
import {
	navigateToFavourites,
	navigateToHome,
	navigateToSettings,
} from "./navigationService";

// Parse URL parameters
function parseUrlParams(url: string): Record<string, string> {
	const params: Record<string, string> = {};
	const urlObj = new URL(url);

	urlObj.searchParams.forEach((value, key) => {
		params[key] = value;
	});

	return params;
}

// Handle deep link
export function handleDeepLink(url: string) {
	console.log("Deep link received:", url);

	try {
		const urlObj = new URL(url);

		// Handle favourites deep link
		if (urlObj.pathname === "/favourites") {
			const params = parseUrlParams(url);
			const name = params.name;

			if (name) {
				console.log("Navigating to favourites with name:", name);
				navigateToFavourites(decodeURIComponent(name));
			} else {
				console.log("Navigating to favourites without specific name");
				navigateToFavourites();
			}
		}
		// Handle home deep link
		else if (urlObj.pathname === "/home") {
			console.log("Navigating to home");
			navigateToHome();
		}
		// Handle settings deep link
		else if (urlObj.pathname === "/settings") {
			console.log("Navigating to settings");
			navigateToSettings();
		}
		// Handle root path
		else if (urlObj.pathname === "/" || urlObj.pathname === "") {
			console.log("Navigating to home (root path)");
			navigateToHome();
		} else {
			console.log("Unknown deep link path:", urlObj.pathname);
			// Default to home for unknown paths
			navigateToHome();
		}
	} catch (error) {
		console.error("Error handling deep link:", error);
		// Default to home on error
		navigateToHome();
	}
}

// Set up deep linking
export function setupDeepLinking() {
	// Handle deep links when app is already running
	const handleUrl = (url: string) => {
		handleDeepLink(url);
	};

	// Add event listener for deep links
	Linking.addEventListener("url", ({url}) => {
		handleUrl(url);
	});

	// Handle deep links that launched the app
	Linking.getInitialURL().then((url) => {
		if (url) {
			handleUrl(url);
		}
	});
}
