import type {PropsWithChildren} from "react";
import {Animated, Pressable} from "react-native";
import {StyleSheet} from "react-native-unistyles";

import {useButtonAnimation} from "@/app/ui/hooks/useButtonAnimation";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
	onPress: () => void;
};

export function Button({children, onPress}: PropsWithChildren<Props>) {
	const {onPress: onPressAnimation, animatedStyle} = useButtonAnimation();

	return (
		<AnimatedPressable
			style={[styles.container, animatedStyle]}
			onPress={onPress}
			onPressIn={() => onPressAnimation("in")}
			onPressOut={() => onPressAnimation("out")}
		>
			{children}
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	container: {
		backgroundColor: colors.primary,
		padding: sizes["10px"],
		borderRadius: sizes["5px"],
	},
}));
