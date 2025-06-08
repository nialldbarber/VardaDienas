import type {PropsWithChildren} from "react";
import {ScrollView} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {View} from "@/app/ui/components/View";

type Props = {
	header?: React.ReactNode;
	withScroll?: "vertical" | "horizontal" | "none";
};

export function Layout({
	header,
	withScroll = "none",
	children,
}: PropsWithChildren<Props>) {
	const Container = withScroll === "none" ? View : ScrollView;

	return (
		<View style={styles.container}>
			{header && <View>{header}</View>}
			<Container
				horizontal={withScroll === "horizontal"}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={
					withScroll === "none" ? styles.inner : styles.scrollContent
				}
				style={styles.inner}
			>
				<View>{children}</View>
			</Container>
		</View>
	);
}

const styles = StyleSheet.create(({colors, tokens, sizes}, {insets}) => ({
	container: {
		flex: 1,
		backgroundColor: colors.primary,
		paddingTop: insets.top,
	},
	inner: {
		flex: 1,
		backgroundColor: tokens.background.primary,
	},
	scrollContent: {
		backgroundColor: tokens.background.primary,
		flexGrow: 1,
	},
}));
