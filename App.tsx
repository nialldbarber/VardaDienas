import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import React from "react";
import RNBootSplash from "react-native-bootsplash";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";

import {Navigation} from "./app/navigation/RootStack";
import {Toast} from "./app/ui/components/Toast";
import "./app/utils/i18n";

export default function App() {
	React.useEffect(() => {
		const init = async () => {
			await RNBootSplash.hide({fade: true});
		};
		init();
	}, []);

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
		</>
	);
}
