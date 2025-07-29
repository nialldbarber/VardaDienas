import React from "react";
import type {StyleProp, TextProps, TextStyle} from "react-native";
import {Text as NativeText} from "react-native";
import type {UnistylesVariants} from "react-native-unistyles";
import {StyleSheet} from "react-native-unistyles";

import {renderStringWithEmoji} from "@/app/ui/utils/renderStringWithEmoji";

interface Props extends TextProps, UnistylesVariants<typeof styles> {
	withEmoji?: boolean;
	style?: StyleProp<TextStyle>;
}

export function Text({
	variant = "body",
	color,
	children,
	withEmoji = false,
	style,
	...rest
}: Props) {
	styles.useVariants({variant, color});

	const renderChildren = () => {
		return React.Children.map(children, (child) => {
			if (typeof child === "string") {
				return withEmoji ? renderStringWithEmoji(child) : child;
			}
			if (React.isValidElement(child)) {
				return React.cloneElement(child, {
					// @ts-expect-error
					style: {
						// @ts-expect-error
						...child.props.style,
						alignSelf: "baseline",
					},
				});
			}
			return child;
		});
	};

	return (
		<NativeText
			style={[styles.container, style]}
			maxFontSizeMultiplier={1.3}
			{...rest}
		>
			{renderChildren()}
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
						fontFamily: "Plus Jakarta Sans",
						fontWeight: "800",
						lineHeight: 30,
						color: colors.white,
					},
					body: {
						fontSize: 16,
						fontFamily: "Plus Jakarta Sans",
						fontWeight: "500",
						color: colors.black,
					},
				},
				color: colorVariants,
			},
		},
	};
});
