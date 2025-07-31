import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import notifee, {
	EventType,
	type InitialNotification,
} from "@notifee/react-native";
import * as Sentry from "@sentry/react-native";
import React from "react";
import RNBootSplash from "react-native-bootsplash";
import Config from "react-native-config";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";

import {Navigation} from "./app/navigation/RootStack";
import {setupDeepLinking} from "./app/navigation/deepLinking";
import {AnimatedSplash} from "./app/ui/components/AnimatedSplash";
import {Toast} from "./app/ui/components/Toast";
import "./app/utils/i18n";

Sentry.init({
	dsn: Config.SENTRY_DSN,
	sendDefaultPii: true,
});

export default Sentry.wrap(function App() {
	const [showSplash, setShowSplash] = React.useState(true);

	React.useEffect(() => {
		const init = async () => {
			await RNBootSplash.hide();
		};
		init();
	}, []);

	// Set up deep linking
	React.useEffect(() => {
		setupDeepLinking();
	}, []);

	// Set up notification event listeners
	React.useEffect(() => {
		// Handle notification when app is in foreground and user taps it
		const unsubscribeOnForegroundEvent = notifee.onForegroundEvent(
			({type, detail}) => {
				if (type === EventType.PRESS) {
					console.log("Notification pressed:", detail);
					// Extract deep link from notification data and handle it
					const deepLink = detail.notification?.data?.deepLink as
						| string
						| undefined;
					if (deepLink) {
						import("./app/navigation/deepLinking").then(({handleDeepLink}) => {
							handleDeepLink(deepLink);
						});
					}
				}
			},
		);

		// Handle notification when app is closed and user taps it
		const getInitialNotification = async () => {
			const initialNotification: InitialNotification | null =
				await notifee.getInitialNotification();
			if (initialNotification) {
				console.log("Initial notification:", initialNotification);
				// Extract deep link from notification data and handle it
				const deepLink = initialNotification.notification?.data?.deepLink as
					| string
					| undefined;
				if (deepLink) {
					import("./app/navigation/deepLinking").then(({handleDeepLink}) => {
						handleDeepLink(deepLink);
					});
				}
			}
		};

		getInitialNotification();

		return () => {
			unsubscribeOnForegroundEvent();
		};
	}, []);

	const handleSplashComplete = () => {
		setShowSplash(false);
	};

	return (
		<>
			<GestureHandlerRootView style={{flex: 1}}>
				<BottomSheetModalProvider>
					<SafeAreaProvider>
						<Navigation />
					</SafeAreaProvider>
				</BottomSheetModalProvider>
			</GestureHandlerRootView>
			<Toast />
			{showSplash && (
				<AnimatedSplash onAnimationComplete={handleSplashComplete} />
			)}
		</>
	);
});
