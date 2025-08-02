import type {PressableProps, StyleProp, ViewStyle} from "react-native";
import {Pressable as RNPressable} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

interface Props extends PressableProps {
	style?: StyleProp<ViewStyle>;
	animateStyle?: "scale" | "opacity" | "none";
}
export function Pressable({
	animateStyle = "scale",
	children,
	style,
	...rest
}: Props) {
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	const handlePressIn = () => {
		if (animateStyle === "scale") {
			scale.value = withTiming(0.9);
		} else if (animateStyle === "opacity") {
			opacity.value = withTiming(0.5);
		} else if (animateStyle === "none") {
			scale.value = 1;
			opacity.value = 1;
		}
	};
	const handlePressOut = () => {
		if (animateStyle === "scale") {
			scale.value = withTiming(1);
		} else if (animateStyle === "opacity") {
			opacity.value = withTiming(1);
		} else if (animateStyle === "none") {
			scale.value = 1;
			opacity.value = 1;
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{scale: scale.value}],
		opacity: opacity.value,
	}));

	return (
		<AnimatedPressable
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[style, animatedStyle]}
			{...rest}
		>
			{children}
		</AnimatedPressable>
	);
}
