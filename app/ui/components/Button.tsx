import type {PropsWithChildren} from "react";
import {Pressable} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import type {UnistylesVariants} from "react-native-unistyles";
import {StyleSheet} from "react-native-unistyles";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends UnistylesVariants<typeof styles> {
	onPress: () => void;
}

export function Button({
	children,
	onPress,
	variant = "primary",
}: PropsWithChildren<Props>) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{scale: scale.value}],
	}));

	const handlePressIn = () => {
		scale.value = withSpring(0.95, {
			overshootClamping: false,
			restDisplacementThreshold: 0.01,
			restSpeedThreshold: 2,
		});
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, {
			overshootClamping: false,
			restDisplacementThreshold: 0.01,
			restSpeedThreshold: 2,
		});
	};

	styles.useVariants({variant});

	return (
		<AnimatedPressable
			style={[styles.container, animatedStyle]}
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
		>
			{children}
		</AnimatedPressable>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	container: {
		alignItems: "center",
		justifyContent: "center",
		padding: sizes["10px"],
		variants: {
			variant: {
				primary: {
					backgroundColor: colors.primary,
					borderRadius: sizes["5px"],
				},
				outline: {
					backgroundColor: "transparent",
					borderWidth: 1,
					borderColor: colors.primary,
					borderRadius: sizes["5px"],
				},
			},
		},
	},
}));
