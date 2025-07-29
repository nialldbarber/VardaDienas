import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import * as Sentry from "@sentry/react-native";
import React from "react";
import RNBootSplash from "react-native-bootsplash";
import Config from "react-native-config";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";

import {LogBox} from "react-native";
import {Navigation} from "./app/navigation/RootStack";
import {AnimatedSplash} from "./app/ui/components/AnimatedSplash";
import {Toast} from "./app/ui/components/Toast";
import "./app/utils/i18n";

Sentry.init({
	dsn: Config.SENTRY_DSN,
	sendDefaultPii: true,
});

export default Sentry.wrap(function App() {
	const [showSplash, setShowSplash] = React.useState(true);

	LogBox.ignoreAllLogs();

	React.useEffect(() => {
		const init = async () => {
			await RNBootSplash.hide();
		};
		init();
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
