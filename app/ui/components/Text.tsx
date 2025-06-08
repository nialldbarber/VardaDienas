import React from "react";
import type {TextProps} from "react-native";
import {Text as NativeText} from "react-native";
import type {UnistylesVariants} from "react-native-unistyles";
import {StyleSheet} from "react-native-unistyles";

// const NativeText: React.FC<TextProps> = (props) =>
// 	React.createElement("RCTText", props);

interface Props extends TextProps, UnistylesVariants<typeof styles> {}

export function Text({variant = "body", color, children, ...rest}: Props) {
	styles.useVariants({variant, color});

	return (
		<NativeText style={styles.container} {...rest}>
			{children}
		</NativeText>
	);
}

const styles = StyleSheet.create(({colors}) => {
	const colorVariants = Object.fromEntries(
		Object.entries(colors).map(([key, value]) => [key, {color: value}]),
	) as Record<keyof typeof colors, {color: string}>;

	return {
		container: {
			variants: {
				variant: {
					header: {
						fontSize: 24,
						fontWeight: "600",
						lineHeight: 30,
						color: colors.white,
					},
					body: {
						fontSize: 16,
						fontWeight: "500",
						color: colors.black,
						lineHeight: 20,
					},
				},
				color: colorVariants,
			},
		},
	};
});
