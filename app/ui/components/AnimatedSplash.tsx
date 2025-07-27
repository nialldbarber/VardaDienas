import React from "react";
import {Image} from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import {colors} from "@/app/ui/config/colors";
import {StyleSheet} from "react-native-unistyles";

type Props = {
	onAnimationComplete: () => void;
};

export function AnimatedSplash({onAnimationComplete}: Props) {
	const logoTranslateY = useSharedValue(0);
	const screenOpacity = useSharedValue(1);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			logoTranslateY.value = withSpring(
				-50,
				{
					damping: 8,
					stiffness: 200,
					mass: 0.5,
				},
				() => {
					// Start fading the screen when logo starts going down, but with longer duration
					screenOpacity.value = withTiming(0, {
						duration: 400,
					});

					logoTranslateY.value = withSpring(
						500,
						{
							damping: 12,
							stiffness: 150,
							mass: 0.8,
						},
						() => {
							runOnJS(onAnimationComplete)();
						},
					);
				},
			);
		}, 300);

		return () => clearTimeout(timer);
	}, [logoTranslateY, screenOpacity, onAnimationComplete]);

	const logoAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{translateY: logoTranslateY.value}],
		};
	});

	const screenAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: screenOpacity.value,
		};
	});

	return (
		<Animated.View style={[styles.container, screenAnimatedStyle]}>
			<Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
				<Image
					source={require("../../../assets/bootsplash/logo.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
			</Animated.View>
		</Animated.View>
	);
}

const styles = StyleSheet.create(() => ({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.white,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 9999,
	},
	logoContainer: {
		// Container for the logo that will animate
	},
	logo: {
		width: 85,
		height: 85,
	},
}));
