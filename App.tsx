import {GestureHandlerRootView} from "react-native-gesture-handler";
import {SafeAreaProvider} from "react-native-safe-area-context";

import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import {Navigation} from "./app/navigation/RootStack";

export default function App() {
	return (
		<GestureHandlerRootView style={{flex: 1}}>
			<BottomSheetModalProvider>
				<SafeAreaProvider>
					<Navigation />
				</SafeAreaProvider>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}
