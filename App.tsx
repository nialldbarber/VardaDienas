import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import React from "react";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";

import {Navigation} from "./app/navigation/RootStack";
import {Toast} from "./app/ui/components/Toast";

export default function App() {
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
