import React from "react";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import {StyleSheet} from "react-native-unistyles";

import {Text} from "@/app/ui/components/Text";
import {View} from "@/app/ui/components/View";

type Props = {
	months: string[];
	onMonthSelect: (monthIndex: number) => void;
	containerHeight: number;
};

export function FastScrollIndex({
	months,
	onMonthSelect,
	containerHeight,
}: Props) {
	const translateY = useSharedValue(0);
	const isActive = useSharedValue(false);
	const currentIndex = useSharedValue(-1);

	const monthLetters = React.useMemo(() => {
		return months.map((month) => month.charAt(0).toUpperCase());
	}, [months]);

	const panGesture = Gesture.Pan()
		.onStart((event) => {
			isActive.value = true;

			// Use the raw gesture Y coordinate directly
			const clampedY = Math.max(0, Math.min(event.y, containerHeight));
			translateY.value = clampedY;

			// Calculate index based on equal distribution, ensuring we go to start of month
			const rawIndex = (clampedY / containerHeight) * monthLetters.length;
			const index = Math.min(Math.floor(rawIndex), monthLetters.length - 1);

			currentIndex.value = index;
			runOnJS(onMonthSelect)(index);
		})
		.onUpdate((event) => {
			// Use the raw gesture Y coordinate directly
			const clampedY = Math.max(0, Math.min(event.y, containerHeight));
			translateY.value = clampedY;

			// Calculate index based on equal distribution, ensuring we go to start of month
			const rawIndex = (clampedY / containerHeight) * monthLetters.length;
			const index = Math.min(Math.floor(rawIndex), monthLetters.length - 1);

			if (currentIndex.value !== index) {
				currentIndex.value = index;
				runOnJS(onMonthSelect)(index);
			}
		})
		.onEnd(() => {
			isActive.value = false;
			currentIndex.value = -1;
		});

	const indicatorStyle = useAnimatedStyle(() => {
		return {
			opacity: isActive.value ? 1 : 0,
			transform: [
				{
					translateY: translateY.value - 12.5, // Center the 25px indicator
				},
			],
		};
	});

	const containerStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: isActive.value
				? "rgba(164, 52, 58, 0.1)"
				: "transparent",
		};
	});

	return (
		<View style={styles.container}>
			<GestureDetector gesture={panGesture}>
				<Animated.View
					style={[
						styles.scrollTrack,
						containerStyle,
						{height: containerHeight},
					]}
				>
					{monthLetters.map((letter, index) => (
						<View key={`${letter}-${index}`} style={styles.letterContainer}>
							<Text style={styles.letter}>{letter}</Text>
						</View>
					))}
					<Animated.View style={[styles.indicator, indicatorStyle]} />
				</Animated.View>
			</GestureDetector>
		</View>
	);
}

const styles = StyleSheet.create(({colors, sizes}) => ({
	container: {
		position: "absolute",
		right: 5,
		top: 0,
		bottom: 0,
		justifyContent: "center",
		zIndex: 10,
		width: 35,
		pointerEvents: "box-none",
	},
	scrollTrack: {
		width: 35,
		borderRadius: 17,
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 20,
		pointerEvents: "auto",
	},
	letterContainer: {
		justifyContent: "center",
		alignItems: "center",
		height: 20,
	},
	letter: {
		fontSize: 11,
		fontWeight: "600",
		color: colors.primary,
	},
	indicator: {
		position: "absolute",
		width: 25,
		height: 25,
		borderRadius: 12.5,
		backgroundColor: colors.primary,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: colors.black,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
}));
