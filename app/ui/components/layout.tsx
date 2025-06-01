import type {PropsWithChildren} from "react";
import {View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export function Layout({children}: PropsWithChildren) {
	const insets = useSafeAreaInsets();

	return (
		<View style={[{paddingTop: insets.top}]}>
			<View>{children}</View>
		</View>
	);
}
