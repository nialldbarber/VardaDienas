import type {PropsWithChildren} from "react";
import {ScrollView, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type Props = {
	header?: React.ReactNode;
	withScroll?: "vertical" | "horizontal" | "none";
};

export function Layout({
	header,
	withScroll = "none",
	children,
}: PropsWithChildren<Props>) {
	const insets = useSafeAreaInsets();

	const Container = withScroll === "none" ? View : ScrollView;

	return (
		<View style={[{paddingTop: insets.top}]}>
			{header && (
				<View style={{paddingHorizontal: 16, paddingBottom: 8}}>{header}</View>
			)}
			<Container horizontal={withScroll === "horizontal"}>
				<View>{children}</View>
			</Container>
		</View>
	);
}
