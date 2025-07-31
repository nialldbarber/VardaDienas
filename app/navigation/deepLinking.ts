import {Linking} from "react-native";
import {
	navigateToFavourites,
	navigateToHome,
	navigateToSettings,
} from "./navigationService";

// Parse URL parameters
function parseUrlParams(url: string): Record<string, string> {
	const params: Record<string, string> = {};

	// Extract query string from URL
	const queryIndex = url.indexOf("?");
	if (queryIndex === -1) {
		return params;
	}

	const queryString = url.substring(queryIndex + 1);
	const pairs = queryString.split("&");

	for (const pair of pairs) {
		const [key, value] = pair.split("=");
		if (key && value) {
			params[decodeURIComponent(key)] = decodeURIComponent(value);
		}
	}

	return params;
}

// Extract path from URL
function extractPath(url: string): string {
	// Remove protocol and host
	const protocolIndex = url.indexOf("://");
	if (protocolIndex === -1) {
		return "";
	}

	const afterProtocol = url.substring(protocolIndex + 3);
	const pathIndex = afterProtocol.indexOf("/");

	if (pathIndex === -1) {
		return "";
	}

	const pathWithQuery = afterProtocol.substring(pathIndex);
	const queryIndex = pathWithQuery.indexOf("?");

	if (queryIndex === -1) {
		return pathWithQuery;
	}

	return pathWithQuery.substring(0, queryIndex);
}

// Handle deep link
export function handleDeepLink(url: string) {
	console.log("Deep link received:", url);

	try {
		const path = extractPath(url);

		// Handle favourites deep link
		if (path === "/favourites") {
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
		else if (path === "/home") {
			console.log("Navigating to home");
			navigateToHome();
		}
		// Handle settings deep link
		else if (path === "/settings") {
			console.log("Navigating to settings");
			navigateToSettings();
		}
		// Handle root path
		else if (path === "/" || path === "") {
			console.log("Navigating to home (root path)");
			navigateToHome();
		} else {
			console.log("Unknown deep link path:", path);
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
