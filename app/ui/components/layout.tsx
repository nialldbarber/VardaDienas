import type {PropsWithChildren} from "react";
import React from "react";
import {ScrollView} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {View} from "@/app/ui/components/View";

type Props = {
	header?: React.ReactNode;
	withScroll?: "vertical" | "horizontal" | "none";
};

export const Layout = React.forwardRef<ScrollView, PropsWithChildren<Props>>(
	({header, withScroll = "none", children}, ref) => {
		const Container = withScroll === "none" ? View : ScrollView;

		if (withScroll === "none") {
			return (
				<View style={styles.container}>
					{header && <View>{header}</View>}
					<View style={styles.inner}>{children}</View>
				</View>
			);
		}

		return (
			<View style={styles.container}>
				{header && <View>{header}</View>}
				<ScrollView
					ref={ref}
					horizontal={withScroll === "horizontal"}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					style={styles.inner}
				>
					<View>{children}</View>
				</ScrollView>
			</View>
		);
	},
);

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
