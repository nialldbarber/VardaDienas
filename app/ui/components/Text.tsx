import React from "react";
import type {StyleProp, TextProps, TextStyle} from "react-native";
import {Text as NativeText} from "react-native";
import type {UnistylesVariants} from "react-native-unistyles";
import {StyleSheet} from "react-native-unistyles";

interface Props extends TextProps, UnistylesVariants<typeof styles> {
	style?: StyleProp<TextStyle>;
}

export function Text({
	variant = "body",
	color,
	children,
	style,
	...rest
}: Props) {
	styles.useVariants({variant, color});

	return (
		<NativeText style={[styles.container, style]} {...rest}>
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
						fontFamily: "PlusJakartaSans-ExtraBold",
						lineHeight: 30,
						color: colors.white,
					},
					body: {
						fontSize: 16,
						fontFamily: "PlusJakartaSans-Medium",
						color: colors.black,
					},
				},
				color: colorVariants,
			},
		},
	};
});
