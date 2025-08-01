import React from "react";
import {Image, Text} from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";

import {haptics$} from "@/app/store/haptics";
import {colors} from "@/app/ui/config/colors";
import {haptics} from "@/app/utils/haptics";
import {use$} from "@legendapp/state/react";
import {StyleSheet} from "react-native-unistyles";

type Props = {
	onAnimationComplete: () => void;
};

export function AnimatedSplash({onAnimationComplete}: Props) {
	const logoTranslateY = useSharedValue(0);
	const screenOpacity = useSharedValue(1);
	const titleOpacity = useSharedValue(0);
	const titleScale = useSharedValue(0.8);
	const hapticsEnabled = use$(haptics$.enabled);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (hapticsEnabled) {
				haptics.impactMedium();
			}

			logoTranslateY.value = withSpring(
				-50,
				{
					damping: 8,
					stiffness: 200,
					mass: 0.5,
				},
				() => {
					titleOpacity.value = withTiming(1, {
						duration: 300,
					});
					titleScale.value = withSpring(1, {
						damping: 15,
						stiffness: 80,
						mass: 1.0,
					});
				},
			);
		}, 50);

		const fadeOutTimer = setTimeout(() => {
			screenOpacity.value = withTiming(0, {
				duration: 400,
			});

			if (hapticsEnabled) {
				haptics.impactMedium();
			}

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
		}, 3500);

		return () => {
			clearTimeout(timer);
			clearTimeout(fadeOutTimer);
		};
	}, [
		logoTranslateY,
		screenOpacity,
		titleOpacity,
		titleScale,
		onAnimationComplete,
		hapticsEnabled,
	]);

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

	const titleAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: titleOpacity.value,
			transform: [{scale: titleScale.value}],
		};
	});

	return (
		<Animated.View style={[styles.container, screenAnimatedStyle]}>
			<Animated.View style={logoAnimatedStyle}>
				<Image
					source={require("../../../assets/bootsplash/logo.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
			</Animated.View>
			<Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
				<Text style={styles.title}>Vārdu Kalendārs</Text>
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
	logo: {
		width: 85,
		height: 85,
	},
	titleContainer: {
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "600",
		color: colors.primary,
		textAlign: "center",
		fontFamily: "Plus Jakarta Sans",
	},
}));
